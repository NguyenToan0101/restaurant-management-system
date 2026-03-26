package com.example.backend.service;

import com.example.backend.dto.AreaTableDTO;
import com.example.backend.entities.Area;
import com.example.backend.entities.AreaTable;
import com.example.backend.entities.Branch;
import com.example.backend.entities.TableStatus;
import com.example.backend.exception.AppException;
import com.example.backend.exception.ErrorCode;
import com.example.backend.mapper.AreaTableMapper;
import com.example.backend.repositories.AreaRepository;
import com.example.backend.repositories.AreaTableRepository;
import com.example.backend.repositories.StaffAccountRepository;
import com.example.backend.services.AreaTableService;
import com.example.backend.services.NotificationService;
import com.example.backend.services.QrCodeService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

import java.util.Arrays;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.*;

/**
 * Unit tests for AreaTableService using Mockito
 * Note: SecurityContext-dependent methods (getByArea, create, update, delete, setStatus, etc.) 
 * are not tested here as they require Spring Security setup
 */
@ExtendWith(MockitoExtension.class)
class AreaTableServiceTest {

    @Mock
    private AreaTableRepository areaTableRepository;

    @Mock
    private AreaRepository areaRepository;

    @Mock
    private AreaTableMapper areaTableMapper;

    @Mock
    private QrCodeService qrCodeService;

    @Mock
    private StaffAccountRepository staffAccountRepository;

    @Mock
    private NotificationService notificationService;

    @InjectMocks
    private AreaTableService areaTableService;

    private UUID tableId;
    private UUID areaId;
    private UUID branchId;
    private AreaTable testTable;
    private AreaTableDTO testTableDTO;
    private Area testArea;
    private Branch testBranch;

    @BeforeEach
    void setUp() {
        tableId = UUID.randomUUID();
        areaId = UUID.randomUUID();
        branchId = UUID.randomUUID();

        testBranch = new Branch();
        testBranch.setBranchId(branchId);
        testBranch.setAddress("123 Test St");

        testArea = new Area();
        testArea.setAreaId(areaId);
        testArea.setName("Main Hall");
        testArea.setBranch(testBranch);

        testTable = new AreaTable();
        testTable.setAreaTableId(tableId);
        testTable.setTag("T01");
        testTable.setCapacity(4);
        testTable.setStatus(TableStatus.FREE);
        testTable.setQr("qr-code-123");
        testTable.setArea(testArea);

        testTableDTO = new AreaTableDTO();
        testTableDTO.setAreaTableId(tableId);
        testTableDTO.setTag("T01");
        testTableDTO.setCapacity(4);
        testTableDTO.setStatus(TableStatus.FREE);
        testTableDTO.setQr("qr-code-123");
        testTableDTO.setAreaId(areaId);
    }

    @Test
    @DisplayName("Should get all tables")
    void testGetAll() {
        // Given
        List<AreaTable> tables = Arrays.asList(testTable);
        when(areaTableRepository.findAll()).thenReturn(tables);
        when(areaTableMapper.toDto(testTable)).thenReturn(testTableDTO);

        // When
        List<AreaTableDTO> result = areaTableService.getAll();

        // Then
        assertThat(result).hasSize(1);
        assertThat(result.get(0).getTag()).isEqualTo("T01");
        verify(areaTableRepository).findAll();
    }

    @Test
    @DisplayName("Should get all tables paginated")
    void testGetAllPaginated() {
        // Given
        Pageable pageable = PageRequest.of(0, 10);
        Page<AreaTable> tablePage = new PageImpl<>(Arrays.asList(testTable));
        when(areaTableRepository.findAll(pageable)).thenReturn(tablePage);
        when(areaTableMapper.toDto(testTable)).thenReturn(testTableDTO);

        // When
        Page<AreaTableDTO> result = areaTableService.getAllPaginated(pageable);

        // Then
        assertThat(result.getContent()).hasSize(1);
        assertThat(result.getContent().get(0).getTag()).isEqualTo("T01");
        verify(areaTableRepository).findAll(pageable);
    }

    @Test
    @DisplayName("Should get table by ID")
    void testGetById() {
        // Given
        when(areaTableRepository.findById(tableId)).thenReturn(Optional.of(testTable));
        when(areaTableMapper.toDto(testTable)).thenReturn(testTableDTO);

        // When
        AreaTableDTO result = areaTableService.getById(tableId);

        // Then
        assertThat(result).isNotNull();
        assertThat(result.getTag()).isEqualTo("T01");
        verify(areaTableRepository).findById(tableId);
    }

    @Test
    @DisplayName("Should throw exception when table not found")
    void testGetByIdNotFound() {
        // Given
        when(areaTableRepository.findById(tableId)).thenReturn(Optional.empty());

        // When & Then
        assertThatThrownBy(() -> areaTableService.getById(tableId))
            .isInstanceOf(AppException.class)
            .hasFieldOrPropertyWithValue("errorCode", ErrorCode.TABLE_NOT_FOUND);
    }

    @Test
    @DisplayName("Should get tables by public area")
    void testGetByPublicArea() {
        // Given
        List<AreaTable> tables = Arrays.asList(testTable);
        when(areaTableRepository.findByArea_AreaId(areaId)).thenReturn(tables);
        when(areaTableMapper.toDto(testTable)).thenReturn(testTableDTO);

        // When
        List<AreaTableDTO> result = areaTableService.getByPublicArea(areaId);

        // Then
        assertThat(result).hasSize(1);
        assertThat(result.get(0).getTag()).isEqualTo("T01");
        verify(areaTableRepository).findByArea_AreaId(areaId);
    }

    @Test
    @DisplayName("Should get tables by branch")
    void testGetByBranch() {
        // Given
        List<AreaTable> tables = Arrays.asList(testTable);
        when(areaTableRepository.findByBranchId(branchId)).thenReturn(tables);
        when(areaTableMapper.toDto(testTable)).thenReturn(testTableDTO);

        // When
        List<AreaTableDTO> result = areaTableService.getByBranch(branchId);

        // Then
        assertThat(result).hasSize(1);
        assertThat(result.get(0).getTag()).isEqualTo("T01");
        verify(areaTableRepository).findByBranchId(branchId);
    }

    @Test
    @DisplayName("Should get tables by branch paginated")
    void testGetByBranchPaginated() {
        // Given
        Pageable pageable = PageRequest.of(0, 10);
        Page<AreaTable> tablePage = new PageImpl<>(Arrays.asList(testTable));
        when(areaTableRepository.findByBranchId(branchId, pageable)).thenReturn(tablePage);
        when(areaTableMapper.toDto(testTable)).thenReturn(testTableDTO);

        // When
        Page<AreaTableDTO> result = areaTableService.getByBranchPaginated(branchId, pageable);

        // Then
        assertThat(result.getContent()).hasSize(1);
        assertThat(result.getContent().get(0).getTag()).isEqualTo("T01");
        verify(areaTableRepository).findByBranchId(branchId, pageable);
    }

    @Test
    @DisplayName("Should get table by QR code")
    void testGetByQrCode() {
        // Given
        String qrCode = "qr-code-123";
        when(areaTableRepository.findByQr(qrCode)).thenReturn(Optional.of(testTable));
        when(areaTableMapper.toDto(testTable)).thenReturn(testTableDTO);

        // When
        AreaTableDTO result = areaTableService.getByQrCode(qrCode);

        // Then
        assertThat(result).isNotNull();
        assertThat(result.getQr()).isEqualTo(qrCode);
        verify(areaTableRepository).findByQr(qrCode);
    }

    @Test
    @DisplayName("Should throw exception when QR code not found")
    void testGetByQrCodeNotFound() {
        // Given
        String qrCode = "invalid-qr";
        when(areaTableRepository.findByQr(qrCode)).thenReturn(Optional.empty());

        // When & Then
        assertThatThrownBy(() -> areaTableService.getByQrCode(qrCode))
            .isInstanceOf(AppException.class)
            .hasFieldOrPropertyWithValue("errorCode", ErrorCode.TABLE_NOT_FOUND);
    }
}
