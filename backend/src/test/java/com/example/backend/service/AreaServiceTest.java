package com.example.backend.service;

import com.example.backend.dto.AreaDTO;
import com.example.backend.entities.Area;
import com.example.backend.entities.Branch;
import com.example.backend.entities.EntityStatus;
import com.example.backend.mapper.AreaMapper;
import com.example.backend.repositories.AreaRepository;
import com.example.backend.repositories.BranchRepository;
import com.example.backend.repositories.StaffAccountRepository;
import com.example.backend.services.AreaService;
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
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.*;

/**
 * Unit tests for AreaService using Mockito
 * Note: SecurityContext-dependent methods (getById, getByBranch, create, update, delete, etc.) 
 * are not tested here as they require Spring Security setup
 */
@ExtendWith(MockitoExtension.class)
class AreaServiceTest {

    @Mock
    private AreaRepository areaRepository;

    @Mock
    private BranchRepository branchRepository;

    @Mock
    private AreaMapper areaMapper;

    @Mock
    private StaffAccountRepository staffAccountRepository;

    @InjectMocks
    private AreaService areaService;

    private UUID areaId;
    private UUID branchId;
    private Area testArea;
    private AreaDTO testAreaDTO;
    private Branch testBranch;

    @BeforeEach
    void setUp() {
        areaId = UUID.randomUUID();
        branchId = UUID.randomUUID();

        testBranch = new Branch();
        testBranch.setBranchId(branchId);
        testBranch.setAddress("123 Test St");

        testArea = new Area();
        testArea.setAreaId(areaId);
        testArea.setName("Main Hall");
        testArea.setStatus(EntityStatus.ACTIVE);
        testArea.setBranch(testBranch);

        testAreaDTO = new AreaDTO();
        testAreaDTO.setAreaId(areaId);
        testAreaDTO.setName("Main Hall");
        testAreaDTO.setStatus(EntityStatus.ACTIVE);
        testAreaDTO.setBranchId(branchId);
    }

    @Test
    @DisplayName("Should get all areas")
    void testGetAll() {
        // Given
        List<Area> areas = Arrays.asList(testArea);
        when(areaRepository.findAll()).thenReturn(areas);
        when(areaMapper.toDto(testArea)).thenReturn(testAreaDTO);

        // When
        List<AreaDTO> result = areaService.getAll();

        // Then
        assertThat(result).hasSize(1);
        assertThat(result.get(0).getName()).isEqualTo("Main Hall");
        verify(areaRepository).findAll();
    }

    @Test
    @DisplayName("Should get all areas paginated")
    void testGetAllPaginated() {
        // Given
        Pageable pageable = PageRequest.of(0, 10);
        Page<Area> areaPage = new PageImpl<>(Arrays.asList(testArea));
        when(areaRepository.findAll(pageable)).thenReturn(areaPage);
        when(areaMapper.toDto(testArea)).thenReturn(testAreaDTO);

        // When
        Page<AreaDTO> result = areaService.getAllPaginated(pageable);

        // Then
        assertThat(result.getContent()).hasSize(1);
        assertThat(result.getContent().get(0).getName()).isEqualTo("Main Hall");
        verify(areaRepository).findAll(pageable);
    }

    @Test
    @DisplayName("Should get areas by public branch")
    void testGetByPublicBranch() {
        // Given
        List<Area> areas = Arrays.asList(testArea);
        when(areaRepository.findByBranch_BranchId(branchId)).thenReturn(areas);
        when(areaMapper.toDto(testArea)).thenReturn(testAreaDTO);

        // When
        List<AreaDTO> result = areaService.getByPublicBranch(branchId);

        // Then
        assertThat(result).hasSize(1);
        assertThat(result.get(0).getName()).isEqualTo("Main Hall");
        verify(areaRepository).findByBranch_BranchId(branchId);
    }
}
