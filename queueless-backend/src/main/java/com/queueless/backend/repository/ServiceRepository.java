package com.queueless.backend.repository;

import com.queueless.backend.entity.Service;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ServiceRepository extends JpaRepository<Service, Long> {

    List<Service> findByActiveTrue();
}
