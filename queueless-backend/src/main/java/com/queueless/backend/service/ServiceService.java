package com.queueless.backend.service;

import com.queueless.backend.entity.Service;
import com.queueless.backend.repository.ServiceRepository;
import com.queueless.backend.exception.BadRequestException;
import com.queueless.backend.exception.ResourceNotFoundException;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class ServiceService {

    private final ServiceRepository serviceRepository;

    public ServiceService(ServiceRepository serviceRepository) {
        this.serviceRepository = serviceRepository;
    }

    // Get all services
    public List<Service> getAllServices() {
        return serviceRepository.findAll();
    }

    // Get only active services
    public List<Service> getActiveServices() {
        return serviceRepository.findByActiveTrue();
    }

    // Get service by ID
    public Service getServiceById(Long id) {

        return serviceRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Service not found with id: " + id
                        ));
    }

    // Create a new service
    public Service createService(Service service) {

        // Validate service name
        if (service.getName() == null ||
                service.getName().trim().isEmpty()) {

            throw new BadRequestException(
                    "Service name cannot be empty"
            );
        }

        // Validate average service time
        if (service.getAverageServiceTime() <= 0) {

            throw new BadRequestException(
                    "Average service time must be greater than 0"
            );
        }

        // New services are active by default
        service.setActive(true);

        return serviceRepository.save(service);
    }

    // Update existing service
    public Service updateService(
            Long id,
            Service updatedService
    ) {

        // First check whether service exists
        Service existingService = getServiceById(id);

        // Validate service name
        if (updatedService.getName() == null ||
                updatedService.getName().trim().isEmpty()) {

            throw new BadRequestException(
                    "Service name cannot be empty"
            );
        }

        // Validate average service time
        if (updatedService.getAverageServiceTime() <= 0) {

            throw new BadRequestException(
                    "Average service time must be greater than 0"
            );
        }

        // Update fields
        existingService.setName(
                updatedService.getName()
        );

        existingService.setDescription(
                updatedService.getDescription()
        );

        existingService.setAverageServiceTime(
                updatedService.getAverageServiceTime()
        );

        existingService.setActive(
                updatedService.getActive()
        );

        return serviceRepository.save(existingService);
    }

    // Soft delete service
    public void deleteService(Long id) {

        // First check whether service exists
        Service existingService = getServiceById(id);

        /*
         * Soft delete:
         * We don't physically delete the service because
         * existing queue tickets may still reference it.
         */
        existingService.setActive(false);

        serviceRepository.save(existingService);
    }
}