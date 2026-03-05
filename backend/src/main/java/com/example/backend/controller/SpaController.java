package com.example.backend.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

/**
 * Controller to handle SPA (Single Page Application) routing.
 * Forwards all non-API requests to index.html for client-side routing.
 */
@Controller
public class SpaController {
    
    /**
     * Forward all non-API routes to index.html to support React Router.
     * This allows client-side routing to work properly when users
     * directly access routes like /login, /auth/google/callback, etc.
     * 
     * Pattern explanation:
     * - {path:[^\\.]*} matches any path without a dot (excludes files like favicon.ico, .js, .css)
     * - This ensures static assets are served normally while SPA routes are forwarded
     */
    @GetMapping(value = {
        "/{path:^(?!api|actuator).*$}",           // Match root level paths except /api and /actuator
        "/**/{path:^(?!api|actuator)[^\\.]*$}"   // Match nested paths except /api and /actuator, excluding files with extensions
    })
    public String forward() {
        return "forward:/index.html";
    }
}
