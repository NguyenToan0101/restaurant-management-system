package com.example.backend.dto;

import lombok.*;
import java.time.Instant;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AreaDTO {

    private UUID areaId;

    private UUID branchId;

    private String name;

    private String description;

    private Instant createdAt;

    private Instant updatedAt;

}
