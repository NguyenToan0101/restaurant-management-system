package com.example.backend.dto.response;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class GoogleUserInfo {
    
    private String sub;
    
    private String email;
    
    private String name;
    
    @JsonProperty("email_verified")
    private Boolean emailVerified;
    
    private String picture;
}
