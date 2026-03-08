package com.example.backend.services;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

import com.example.backend.dto.request.RestaurantCreateRequest;
import com.example.backend.dto.RestaurantDTO;
import com.example.backend.entities.Restaurant;
import com.example.backend.exception.AppException;
import com.example.backend.exception.ErrorCode;
import com.example.backend.mapper.RestaurantMapper;
import com.example.backend.repositories.RestaurantRepository;
import com.example.backend.repositories.UserRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.example.backend.repositories.BranchRepository;

@Service
public class RestaurantService {

    private final RestaurantRepository restaurantRepository;
    private final RestaurantMapper restaurantMapper;
    private final UserRepository userRepository;
    // private final SubscriptionRepository subscriptionRepository;
    private final BranchRepository branchRepository;

    @Value("${frontend.base-url}")
    private String webUrl; // 👈 lấy từ application.yml

    public RestaurantService(
            RestaurantRepository restaurantRepository,
            RestaurantMapper restaurantMapper,
            UserRepository userRepository,
            // SubscriptionRepository subscriptionRepository,
            BranchRepository branchRepository) {
        this.restaurantRepository = restaurantRepository;
        this.restaurantMapper = restaurantMapper;
        this.userRepository = userRepository;
        // this.subscriptionRepository = subscriptionRepository;
        this.branchRepository = branchRepository;
    }

    public List<RestaurantDTO> getAll() {
        return restaurantRepository.findAll().stream()
                .map(restaurantMapper::toRestaurantDtoWithFullUrl)
                .toList();
    }

    public RestaurantDTO getById(UUID id) {
        Restaurant restaurant = restaurantRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.RESTAURANT_NOTEXISTED));
        return restaurantMapper.toRestaurantDtoWithFullUrl(restaurant);
    }

    @Transactional
    public RestaurantDTO create(RestaurantCreateRequest request) {
        Restaurant restaurant = createEntity(request);
        return restaurantMapper.toRestaurantDtoWithFullUrl(restaurant);
    }

    @Transactional
    public Restaurant createEntity(RestaurantCreateRequest request) {
        var owner = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        Restaurant restaurant = new Restaurant();
        restaurant.setUser(owner);
        restaurant.setName(request.getName());
        restaurant.setEmail(request.getEmail());
        restaurant.setRestaurantPhone(request.getRestaurantPhone());
        restaurant.setDescription(request.getDescription());
        restaurant.setStatus(true); // Set status to true by default

        // Set publicUrl from request or auto-generate from name
        String slug;
        if (request.getPublicUrl() != null && !request.getPublicUrl().trim().isEmpty()) {
            // User provided a custom slug - sanitize it
            slug = request.getPublicUrl()
                    .toLowerCase()
                    .trim()
                    .replaceAll("[^a-z0-9-]+", "-")
                    .replaceAll("(^-|-$)", "");
        } else {
            // Auto-generate slug from restaurant name
            slug = request.getName()
                    .toLowerCase()
                    .trim()
                    .replaceAll("[^a-z0-9]+", "-")
                    .replaceAll("(^-|-$)", "");
        }
        
        // Store ONLY the slug in database for flexibility
        restaurant.setPublicUrl(slug);

        return restaurantRepository.save(restaurant);
    }

    public RestaurantDTO update(UUID id, RestaurantDTO dto) {
        Restaurant exist = restaurantRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.RESTAURANT_NOTEXISTED));

        exist.setName(dto.getName());
        exist.setEmail(dto.getEmail());
        exist.setRestaurantPhone(dto.getRestaurantPhone());
        exist.setStatus(dto.isStatus());
        exist.setPublicUrl(dto.getPublicUrl());
        exist.setDescription(dto.getDescription());

        Restaurant saved = restaurantRepository.save(exist);
        return restaurantMapper.toRestaurantDtoWithFullUrl(saved);
    }

    @Transactional
    public void delete(UUID id) {
        Restaurant restaurant = restaurantRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.RESTAURANT_NOTEXISTED));

        try {
            // List<Subscription> subs =
            // subscriptionRepository.findAllByRestaurant_RestaurantId(id);
            // for (Subscription s : subs) {
            // if (s.getStatus() != SubscriptionStatus.CANCELED && s.getStatus() !=
            // SubscriptionStatus.EXPIRED) {
            // s.setStatus(SubscriptionStatus.CANCELED);
            // s.setUpdatedAt(Instant.now());
            // subscriptionRepository.save(s);
            // }
            // }

            branchRepository.deactivateAllByRestaurantId(id);

            restaurant.setStatus(false);
            restaurant.setUpdatedAt(Instant.now());
            restaurantRepository.save(restaurant);

        } catch (Exception e) {
            throw new AppException(ErrorCode.RESTAURANT_DELETE_FAILED);
        }
    }

    public List<RestaurantDTO> getByOwner(UUID userId) {
        // Get current authenticated user
        var authentication = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.getPrincipal() instanceof com.example.backend.entities.User) {
            com.example.backend.entities.User currentUser = (com.example.backend.entities.User) authentication.getPrincipal();
            
            // Check if current user is requesting their own restaurants
            if (!currentUser.getUserId().equals(userId)) {
                throw new AppException(ErrorCode.UNAUTHORIZED);
            }
        }
        
        return restaurantRepository.findByUser_UserId(userId).stream()
                .map(restaurantMapper::toRestaurantDtoWithFullUrl)
                .toList();
    }

    // public PageResponse<RestaurantDTO> getRestaurantPaginated(int page, int size)
    // {
    // Pageable pageable = PageRequest.of(page - 1, size,
    // Sort.by("createdAt").descending());
    // Page<Restaurant> pageData = restaurantRepository.findByStatus(pageable,
    // true);
    // PageResponse<RestaurantDTO> pageResponse = new PageResponse<>();
    // pageResponse.setItems(pageData.map(restaurantMapper::toRestaurantDto).toList());
    // pageResponse.setTotalElements(pageData.getTotalElements());
    // pageResponse.setTotalPages(pageData.getTotalPages());
    // return pageResponse;
    // }
}
