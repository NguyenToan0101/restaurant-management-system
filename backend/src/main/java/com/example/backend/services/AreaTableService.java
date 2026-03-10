package com.example.backend.services;

import java.util.List;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.backend.dto.AreaTableDTO;
import com.example.backend.entities.Area;
import com.example.backend.entities.AreaTable;
import com.example.backend.entities.TableStatus;
import com.example.backend.entities.User;
import com.example.backend.exception.AppException;
import com.example.backend.exception.ErrorCode;
import com.example.backend.mapper.AreaTableMapper;
import com.example.backend.repositories.AreaRepository;
import com.example.backend.repositories.AreaTableRepository;

@Service
public class AreaTableService {

    private final AreaTableRepository areaTableRepository;
    private final AreaRepository areaRepository;
    private final AreaTableMapper areaTableMapper;
    private final QrCodeService qrCodeService;

    public AreaTableService(
            AreaTableRepository areaTableRepository,
            AreaRepository areaRepository,
            AreaTableMapper areaTableMapper,
            QrCodeService qrCodeService) {
        this.areaTableRepository = areaTableRepository;
        this.areaRepository = areaRepository;
        this.areaTableMapper = areaTableMapper;
        this.qrCodeService = qrCodeService;
    }

    private User getCurrentUser() {
        var authentication = org.springframework.security.core.context.SecurityContextHolder.getContext()
                .getAuthentication();
        if (authentication != null && authentication.getPrincipal() instanceof User) {
            return (User) authentication.getPrincipal();
        }
        throw new AppException(ErrorCode.UNAUTHORIZED);
    }

    private void checkAreaAccess(UUID areaId) {
        User currentUser = getCurrentUser();
        Area area = areaRepository.findById(areaId)
                .orElseThrow(() -> new AppException(ErrorCode.AREA_NOT_FOUND));

        // Check if user is the restaurant owner
        if (!area.getBranch().getRestaurant().getUser().getUserId().equals(currentUser.getUserId())) {
            throw new AppException(ErrorCode.UNAUTHORIZED);
        }
    }

    public List<AreaTableDTO> getAll() {
        return areaTableRepository.findAll().stream()
                .map(areaTableMapper::toDto)
                .toList();
    }

    public Page<AreaTableDTO> getAllPaginated(Pageable pageable) {
        return areaTableRepository.findAll(pageable)
                .map(areaTableMapper::toDto);
    }

    public AreaTableDTO getById(UUID id) {
        AreaTable table = areaTableRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.TABLE_NOT_FOUND));
        return areaTableMapper.toDto(table);
    }

    public List<AreaTableDTO> getByArea(UUID areaId) {
        checkAreaAccess(areaId);
        return areaTableRepository.findByArea_AreaId(areaId).stream()
                .map(areaTableMapper::toDto)
                .toList();
    }

    public Page<AreaTableDTO> getByAreaPaginated(UUID areaId, Pageable pageable) {
        checkAreaAccess(areaId);
        return areaTableRepository.findByArea_AreaId(areaId, pageable)
                .map(areaTableMapper::toDto);
    }

    public List<AreaTableDTO> getByBranch(UUID branchId) {
        return areaTableRepository.findByBranchId(branchId).stream()
                .map(areaTableMapper::toDto)
                .toList();
    }

    public Page<AreaTableDTO> getByBranchPaginated(UUID branchId, Pageable pageable) {
        return areaTableRepository.findByBranchId(branchId, pageable)
                .map(areaTableMapper::toDto);
    }

    public List<AreaTableDTO> getByAreaAndStatus(UUID areaId, TableStatus status) {
        checkAreaAccess(areaId);
        return areaTableRepository.findByArea_AreaIdAndStatus(areaId, status).stream()
                .map(areaTableMapper::toDto)
                .toList();
    }

    @Transactional
    public AreaTableDTO create(AreaTableDTO dto) {
        try {
            if (dto.getAreaId() == null) {
                throw new AppException(ErrorCode.INVALID_REQUEST);
            }

            // Validate capacity
            if (dto.getCapacity() == null || dto.getCapacity() <= 0) {
                throw new AppException(ErrorCode.INVALID_CAPACITY);
            }

            checkAreaAccess(dto.getAreaId());

            Area area = areaRepository.findById(dto.getAreaId())
                    .orElseThrow(() -> new AppException(ErrorCode.AREA_NOT_FOUND));

            // Check if table tag already exists in this area
            if (areaTableRepository.existsByArea_AreaIdAndTag(dto.getAreaId(), dto.getTag())) {
                throw new AppException(ErrorCode.TABLE_TAG_EXISTED);
            }

            AreaTable table = areaTableMapper.toEntity(dto);
            table.setArea(area);
            table.setStatus(TableStatus.FREE);

            // Save first to get the ID
            AreaTable saved = areaTableRepository.save(table);

            // Generate QR code with the table ID
            try {
                String qrCode = qrCodeService.generateTableQrCode(saved.getAreaTableId());
                saved.setQr(qrCode);
                // Save again with QR code
                saved = areaTableRepository.save(saved);
            } catch (Exception e) {
                // If QR generation fails, log but don't fail the entire operation
                System.err.println("Failed to generate QR code: " + e.getMessage());
                e.printStackTrace();
            }

            return areaTableMapper.toDto(saved);
        } catch (AppException e) {
            throw e;
        } catch (Exception e) {
            System.err.println("Error creating table: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Failed to create table", e);
        }
    }

    @Transactional
    public AreaTableDTO update(UUID id, AreaTableDTO dto) {
        AreaTable existing = areaTableRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.TABLE_NOT_FOUND));

        checkAreaAccess(existing.getArea().getAreaId());

        // Validate capacity if provided
        if (dto.getCapacity() != null && dto.getCapacity() <= 0) {
            throw new AppException(ErrorCode.INVALID_CAPACITY);
        }

        // Check if new tag conflicts with existing table in same area
        if (dto.getTag() != null && !dto.getTag().equals(existing.getTag())) {
            if (areaTableRepository.existsByArea_AreaIdAndTag(
                    existing.getArea().getAreaId(), dto.getTag())) {
                throw new AppException(ErrorCode.TABLE_TAG_EXISTED);
            }
        }

        areaTableMapper.updateEntityFromDto(dto, existing);
        AreaTable saved = areaTableRepository.save(existing);
        return areaTableMapper.toDto(saved);
    }

    @Transactional
    public void delete(UUID id) {
        AreaTable table = areaTableRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.TABLE_NOT_FOUND));

        checkAreaAccess(table.getArea().getAreaId());

        areaTableRepository.delete(table);
    }

    @Transactional
    public AreaTableDTO setStatus(UUID id, TableStatus status) {
        AreaTable table = areaTableRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.TABLE_NOT_FOUND));

        checkAreaAccess(table.getArea().getAreaId());

        table.setStatus(status);
        AreaTable saved = areaTableRepository.save(table);
        return areaTableMapper.toDto(saved);
    }

    @Transactional
    public AreaTableDTO markOutOfOrder(UUID id) {
        return setStatus(id, TableStatus.INACTIVE);
    }

    @Transactional
    public AreaTableDTO markAvailable(UUID id) {
        return setStatus(id, TableStatus.FREE);
    }

    public AreaTableDTO getByQrCode(String qrCode) {
        AreaTable table = areaTableRepository.findByQr(qrCode)
                .orElseThrow(() -> new AppException(ErrorCode.TABLE_NOT_FOUND));
        return areaTableMapper.toDto(table);
    }
}
