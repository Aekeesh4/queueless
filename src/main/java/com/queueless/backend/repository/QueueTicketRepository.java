package com.queueless.backend.repository;

import com.queueless.backend.entity.QueueStatus;
import com.queueless.backend.entity.QueueTicket;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;

import jakarta.persistence.LockModeType;

import java.util.List;
import java.util.Optional;

public interface QueueTicketRepository extends JpaRepository<QueueTicket, Long> {

    Optional<QueueTicket> findTopByService_IdOrderByTokenNumberDesc(Long serviceId);

    List<QueueTicket> findByService_IdOrderByTokenNumberAsc(Long serviceId);

    boolean existsByService_IdAndStatus(
            Long serviceId,
            QueueStatus status
    );

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    Optional<QueueTicket> findFirstByService_IdAndStatusOrderByTokenNumberAsc(
            Long serviceId,
            QueueStatus status
    );

    Optional<QueueTicket> findFirstByService_IdAndStatus(
            Long serviceId,
            QueueStatus status
    );

    long countByService_IdAndStatusAndTokenNumberLessThan(
            Long serviceId,
            QueueStatus status,
            Integer tokenNumber
    );
}