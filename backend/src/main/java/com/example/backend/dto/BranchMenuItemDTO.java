package com.example.backend.dto;

import java.util.UUID;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class BranchMenuItemDTO extends MenuItemDTO {
    private boolean available;
    private UUID branchId;
    private UUID branchMenuItemId;
}