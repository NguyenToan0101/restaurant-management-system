package com.example.backend.services;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

import com.example.backend.dto.request.RestaurantCreateRequest;
import com.example.backend.dto.RestaurantDTO;
// import com.example.backend.dto.response.PageResponse;
import com.example.backend.entities.Restaurant;
import com.example.backend.entities.Subscription;
import com.example.backend.entities.SubscriptionStatus;
import com.example.backend.exception.AppException;
import com.example.backend.exception.ErrorCode;
import com.example.backend.mapper.RestaurantMapper;
import com.example.backend.repositories.RestaurantRepository;
// import com.example.backend.repository.SubscriptionRepository;
import com.example.backend.repositories.UserRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
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
    private String webUrl; // 👈 lấy từ application.yml, ví dụ hilldevil.space

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
                .map(restaurantMapper::toRestaurantDto)
                .toList();
    }

    public RestaurantDTO getById(UUID id) {
        Restaurant restaurant = restaurantRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.RESTAURANT_NOTEXISTED));
        return restaurantMapper.toRestaurantDto(restaurant);
    }

    @Transactional
    public RestaurantDTO create(RestaurantCreateRequest request) {
        Restaurant restaurant = createEntity(request);
        return restaurantMapper.toRestaurantDto(restaurant);
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
        restaurant.setStatus(false);

        // 👉 Xử lý URL thông minh cho cả local và production
        String base = webUrl.trim();

        // Nếu không có http/https -> tự động thêm
        if (!base.startsWith("http://") && !base.startsWith("https://")) {
            if (base.contains("localhost") || base.contains("127.0.0.1")) {
                base = "http://" + base;
            } else {
                base = "https://" + base;
            }
        }

        // Bỏ dấu "/" cuối nếu có
        if (base.endsWith("/")) {
            base = base.substring(0, base.length() - 1);
        }

        // Tạo slug từ tên nhà hàng
        String slug = request.getName()
                .toLowerCase()
                .trim()
                .replaceAll("[^a-z0-9]+", "-")
                .replaceAll("(^-|-$)", "");

        restaurant.setPublicUrl(base + "/" + slug);

        return restaurantRepository.save(restaurant);
    }

    @Transactional
    public RestaurantDTO update(UUID id, RestaurantDTO dto) {
        Restaurant exist = restaurantRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.RESTAURANT_NOTEXISTED));

        if (dto.getName() != null) exist.setName(dto.getName());
        if (dto.getEmail() != null) exist.setEmail(dto.getEmail());
        if (dto.getRestaurantPhone() != null) exist.setRestaurantPhone(dto.getRestaurantPhone());
        if (dto.getDescription() != null) exist.setDescription(dto.getDescription());

        Restaurant saved = restaurantRepository.save(exist);
        return restaurantMapper.toRestaurantDto(saved);
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
        return restaurantRepository.findByUser_UserId(userId).stream()
                .map(restaurantMapper::toRestaurantDto)
                .toList();
    }
    public RestaurantDTO getBySlug(String slug) {
        return restaurantRepository.findByPublicUrl(slug)
                .map(restaurantMapper::toRestaurantDtoWithFullUrl)
                .orElseThrow(() -> new AppException(ErrorCode.RESTAURANT_NOTEXISTED));
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



