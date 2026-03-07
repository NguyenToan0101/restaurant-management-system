package com.example.backend.services;

import java.util.List;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.backend.dto.AreaDTO;
import com.example.backend.entities.Area;
import com.example.backend.entities.Branch;
import com.example.backend.entities.EntityStatus;
import com.example.backend.entities.User;
import com.example.backend.exception.AppException;
import com.example.backend.exception.ErrorCode;
import com.example.backend.mapper.AreaMapper;
import com.example.backend.repositories.AreaRepository;
import com.example.backend.repositories.BranchRepository;

@Service
public class AreaService {

    private final AreaRepository areaRepository;
    private final BranchRepository branchRepository;
    private final AreaMapper areaMapper;

    public AreaService(
            AreaRepository areaRepository,
            BranchRepository branchRepository,
            AreaMapper areaMapper) {
        this.areaRepository = areaRepository;
        this.branchRepository = branchRepository;
        this.areaMapper = areaMapper;
    }

    private User getCurrentUser() {
        var authentication = org.springframework.security.core.context.SecurityContextHolder.getContext()
                .getAuthentication();
        if (authentication != null && authentication.getPrincipal() instanceof User) {
            return (User) authentication.getPrincipal();
        }
        throw new AppException(ErrorCode.UNAUTHORIZED);
    }

    private void checkBranchAccess(UUID branchId) {
        User currentUser = getCurrentUser();
        Branch branch = branchRepository.findById(branchId)
                .orElseThrow(() -> new AppException(ErrorCode.BRANCH_NOTEXISTED));

        // Check if user is the restaurant owner
        if (!branch.getRestaurant().getUser().getUserId().equals(currentUser.getUserId())) {
            throw new AppException(ErrorCode.UNAUTHORIZED);
        }
    }

    public List<AreaDTO> getAll() {
        return areaRepository.findAll().stream()
                .map(areaMapper::toDto)
                .toList();
    }

    public Page<AreaDTO> getAllPaginated(Pageable pageable) {
        return areaRepository.findAll(pageable)
                .map(areaMapper::toDto);
    }

    public AreaDTO getById(UUID id) {
        Area area = areaRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.AREA_NOT_FOUND));
        return areaMapper.toDto(area);
    }

    public List<AreaDTO> getByBranch(UUID branchId) {
        checkBranchAccess(branchId);
        return areaRepository.findByBranch_BranchId(branchId).stream()
                .map(areaMapper::toDto)
                .toList();
    }

    public Page<AreaDTO> getByBranchPaginated(UUID branchId, Pageable pageable) {
        checkBranchAccess(branchId);
        return areaRepository.findByBranch_BranchId(branchId, pageable)
                .map(areaMapper::toDto);
    }

    public List<AreaDTO> getByBranchAndStatus(UUID branchId, EntityStatus status) {
        checkBranchAccess(branchId);
        return areaRepository.findByBranch_BranchIdAndStatus(branchId, status).stream()
                .map(areaMapper::toDto)
                .toList();
    }

    public Page<AreaDTO> getByBranchAndStatusPaginated(UUID branchId, EntityStatus status, Pageable pageable) {
        checkBranchAccess(branchId);
        return areaRepository.findByBranch_BranchIdAndStatus(branchId, status, pageable)
                .map(areaMapper::toDto);
    }

    @Transactional
    public AreaDTO create(AreaDTO dto) {
        if (dto.getBranchId() == null) {
            throw new AppException(ErrorCode.INVALID_REQUEST);
        }

        checkBranchAccess(dto.getBranchId());

        Branch branch = branchRepository.findById(dto.getBranchId())
                .orElseThrow(() -> new AppException(ErrorCode.BRANCH_NOTEXISTED));

        // Check if area name already exists in this branch
        if (areaRepository.existsByBranch_BranchIdAndName(dto.getBranchId(), dto.getName())) {
            throw new AppException(ErrorCode.AREA_NAME_EXISTED);
        }

        Area area = areaMapper.toEntity(dto);
        area.setBranch(branch);
        area.setStatus(EntityStatus.ACTIVE);

        Area saved = areaRepository.save(area);
        return areaMapper.toDto(saved);
    }

    @Transactional
    public AreaDTO update(UUID id, AreaDTO dto) {
        Area existing = areaRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.AREA_NOT_FOUND));

        checkBranchAccess(existing.getBranch().getBranchId());

        // Check if new name conflicts with existing area in same branch
        if (dto.getName() != null && !dto.getName().equals(existing.getName())) {
            if (areaRepository.existsByBranch_BranchIdAndName(
                    existing.getBranch().getBranchId(), dto.getName())) {
                throw new AppException(ErrorCode.AREA_NAME_EXISTED);
            }
        }

        areaMapper.updateEntityFromDto(dto, existing);
        Area saved = areaRepository.save(existing);
        return areaMapper.toDto(saved);
    }

    @Transactional
    public void delete(UUID id) {
        Area area = areaRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.AREA_NOT_FOUND));

        checkBranchAccess(area.getBranch().getBranchId());

        area.setStatus(EntityStatus.DELETED);
        areaRepository.save(area);
    }

    @Transactional
    public AreaDTO activate(UUID id) {
        Area area = areaRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.AREA_NOT_FOUND));

        checkBranchAccess(area.getBranch().getBranchId());

        area.setStatus(EntityStatus.ACTIVE);
        Area saved = areaRepository.save(area);
        return areaMapper.toDto(saved);
    }

    @Transactional
    public AreaDTO deactivate(UUID id) {
        Area area = areaRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.AREA_NOT_FOUND));

        checkBranchAccess(area.getBranch().getBranchId());

        area.setStatus(EntityStatus.INACTIVE);
        Area saved = areaRepository.save(area);
        return areaMapper.toDto(saved);
    }
}
