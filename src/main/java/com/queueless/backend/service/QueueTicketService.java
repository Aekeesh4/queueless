package com.queueless.backend.service;

import com.queueless.backend.dto.CompleteQueueResponse;
import com.queueless.backend.entity.QueueStatus;
import com.queueless.backend.entity.QueueTicket;
import com.queueless.backend.entity.Service;
import com.queueless.backend.exception.ConflictException;
import com.queueless.backend.exception.ResourceNotFoundException;
import com.queueless.backend.repository.QueueTicketRepository;
import com.queueless.backend.repository.ServiceRepository;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Component
public class QueueTicketService {

    private final QueueTicketRepository queueTicketRepository;
    private final ServiceRepository serviceRepository;

    public QueueTicketService(
            QueueTicketRepository queueTicketRepository,
            ServiceRepository serviceRepository
    ) {
        this.queueTicketRepository = queueTicketRepository;
        this.serviceRepository = serviceRepository;
    }

    // =========================================================
    // JOIN QUEUE
    // =========================================================

    public QueueTicket joinQueue(
            String customerName,
            Long serviceId
    ) {

        if (customerName == null || customerName.trim().isEmpty()) {
            throw new IllegalArgumentException(
                    "Customer name cannot be empty"
            );
        }

        Service service = serviceRepository.findById(serviceId)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Service not found with id: " + serviceId
                        )
                );

        if (!service.getActive()) {
            throw new ConflictException(
                    "This service is currently inactive"
            );
        }

        Optional<QueueTicket> lastTicket =
                queueTicketRepository
                        .findTopByService_IdOrderByTokenNumberDesc(serviceId);

        int nextTokenNumber = lastTicket
                .map(ticket -> ticket.getTokenNumber() + 1)
                .orElse(1);

        QueueTicket ticket = new QueueTicket();

        ticket.setCustomerName(customerName.trim());
        ticket.setTokenNumber(nextTokenNumber);
        ticket.setService(service);
        ticket.setStatus(QueueStatus.WAITING);
        ticket.setJoinedAt(LocalDateTime.now());

        return queueTicketRepository.save(ticket);
    }

    // =========================================================
    // GET QUEUE
    // =========================================================

    public List<QueueTicket> getQueue(Long serviceId) {

        serviceRepository.findById(serviceId)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Service not found with id: " + serviceId
                        )
                );

        return queueTicketRepository
                .findByService_IdOrderByTokenNumberAsc(serviceId);
    }

    // =========================================================
    // GET TICKET
    // =========================================================

    public QueueTicket getTicket(Long ticketId) {

        return queueTicketRepository.findById(ticketId)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Ticket not found with id: " + ticketId
                        )
                );
    }

    // =========================================================
    // CALL NEXT CUSTOMER
    // =========================================================

    @Transactional
    public QueueTicket callNextCustomer(Long serviceId) {

        serviceRepository.findById(serviceId)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Service not found with id: " + serviceId
                        )
                );

        boolean someoneIsBeingServed =
                queueTicketRepository.existsByService_IdAndStatus(
                        serviceId,
                        QueueStatus.SERVING
                );

        if (someoneIsBeingServed) {
            throw new ConflictException(
                    "A customer is already being served"
            );
        }

        QueueTicket nextCustomer =
                queueTicketRepository
                        .findFirstByService_IdAndStatusOrderByTokenNumberAsc(
                                serviceId,
                                QueueStatus.WAITING
                        )
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "No customers are waiting in the queue"
                                )
                        );

        nextCustomer.setStatus(QueueStatus.SERVING);

        return queueTicketRepository.save(nextCustomer);
    }

    // =========================================================
    // UPDATE STATUS
    // =========================================================

    public QueueTicket updateStatus(
            Long ticketId,
            QueueStatus status
    ) {

        QueueTicket ticket = getTicket(ticketId);

        if (status == null) {
            throw new IllegalArgumentException(
                    "Status cannot be null"
            );
        }

        QueueStatus currentStatus = ticket.getStatus();

        // No need to update if status is already same
        if (currentStatus == status) {
            throw new ConflictException(
                    "Ticket is already in " + status + " status"
            );
        }

        // CANCELLED ticket cannot be changed
        if (currentStatus == QueueStatus.CANCELLED) {
            throw new ConflictException(
                    "Cancelled ticket cannot be updated"
            );
        }

        // COMPLETED ticket cannot be moved back
        if (currentStatus == QueueStatus.COMPLETED) {
            throw new ConflictException(
                    "Completed ticket cannot be updated"
            );
        }

        // A ticket can become SERVING only if
        // another customer isn't already being served
        if (status == QueueStatus.SERVING) {

            boolean someoneIsBeingServed =
                    queueTicketRepository
                            .existsByService_IdAndStatus(
                                    ticket.getService().getId(),
                                    QueueStatus.SERVING
                            );

            if (someoneIsBeingServed) {
                throw new ConflictException(
                        "A customer is already being served"
                );
            }
        }

        ticket.setStatus(status);

        return queueTicketRepository.save(ticket);
    }

    // =========================================================
    // CANCEL TICKET
    // =========================================================

    public QueueTicket cancelTicket(Long ticketId) {

        QueueTicket ticket = getTicket(ticketId);

        if (ticket.getStatus() == QueueStatus.COMPLETED) {
            throw new ConflictException(
                    "Completed ticket cannot be cancelled"
            );
        }

        if (ticket.getStatus() == QueueStatus.CANCELLED) {
            throw new ConflictException(
                    "Ticket is already cancelled"
            );
        }

        if (ticket.getStatus() == QueueStatus.SERVING) {
            throw new ConflictException(
                    "Currently serving ticket cannot be cancelled"
            );
        }

        ticket.setStatus(QueueStatus.CANCELLED);

        return queueTicketRepository.save(ticket);
    }

    // =========================================================
    // PEOPLE AHEAD
    // =========================================================

    public int getPeopleAhead(Long ticketId) {

        QueueTicket ticket = getTicket(ticketId);

        if (ticket.getStatus() != QueueStatus.WAITING) {
            return 0;
        }

        List<QueueTicket> queue =
                queueTicketRepository
                        .findByService_IdOrderByTokenNumberAsc(
                                ticket.getService().getId()
                        );

        int peopleAhead = 0;

        for (QueueTicket currentTicket : queue) {

            if (currentTicket.getStatus() == QueueStatus.WAITING
                    && currentTicket.getTokenNumber()
                    < ticket.getTokenNumber()) {

                peopleAhead++;
            }
        }

        return peopleAhead;
    }

    // =========================================================
    // ESTIMATED WAIT TIME
    // =========================================================

    public int getEstimatedWaitTime(Long ticketId) {

        QueueTicket ticket = getTicket(ticketId);

        if (ticket.getStatus() != QueueStatus.WAITING) {
            return 0;
        }

        int peopleAhead = getPeopleAhead(ticketId);

        int averageServiceTime =
                ticket.getService().getAverageServiceTime();

        return (peopleAhead + 1) * averageServiceTime;
    }

    // =========================================================
    // CURRENTLY SERVING
    // =========================================================

    public QueueTicket getCurrentlyServing(Long serviceId) {

        serviceRepository.findById(serviceId)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Service not found with id: " + serviceId
                        )
                );

        List<QueueTicket> queue =
                queueTicketRepository
                        .findByService_IdOrderByTokenNumberAsc(serviceId);

        for (QueueTicket ticket : queue) {

            if (ticket.getStatus() == QueueStatus.SERVING) {
                return ticket;
            }
        }

        return null;
    }

    // =========================================================
    // NEXT WAITING
    // =========================================================

    public QueueTicket getNextWaiting(Long serviceId) {

        serviceRepository.findById(serviceId)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Service not found with id: " + serviceId
                        )
                );

        List<QueueTicket> queue =
                queueTicketRepository
                        .findByService_IdOrderByTokenNumberAsc(serviceId);

        for (QueueTicket ticket : queue) {

            if (ticket.getStatus() == QueueStatus.WAITING) {
                return ticket;
            }
        }

        return null;
    }

    // =========================================================
    // WAITING COUNT
    // =========================================================

    public long getWaitingCount(Long serviceId) {

        serviceRepository.findById(serviceId)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Service not found with id: " + serviceId
                        )
                );

        List<QueueTicket> queue =
                queueTicketRepository
                        .findByService_IdOrderByTokenNumberAsc(serviceId);

        long count = 0;

        for (QueueTicket ticket : queue) {

            if (ticket.getStatus() == QueueStatus.WAITING) {
                count++;
            }
        }

        return count;
    }

    // =========================================================
    // COMPLETE CURRENT + CALL NEXT
    // =========================================================

    @Transactional
    public CompleteQueueResponse completeCurrentAndCallNext(
            Long serviceId
    ) {

        serviceRepository.findById(serviceId)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Service not found with id: " + serviceId
                        )
                );

        QueueTicket currentCustomer =
                queueTicketRepository
                        .findFirstByService_IdAndStatusOrderByTokenNumberAsc(
                                serviceId,
                                QueueStatus.SERVING
                        )
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "No customer is currently being served"
                                )
                        );

        currentCustomer.setStatus(QueueStatus.COMPLETED);

        queueTicketRepository.save(currentCustomer);

        QueueTicket nextCustomer =
                queueTicketRepository
                        .findFirstByService_IdAndStatusOrderByTokenNumberAsc(
                                serviceId,
                                QueueStatus.WAITING
                        )
                        .orElse(null);

        if (nextCustomer == null) {

            return new CompleteQueueResponse(
                    currentCustomer,
                    null,
                    "Customer completed. No customers are waiting."
            );
        }

        nextCustomer.setStatus(QueueStatus.SERVING);

        queueTicketRepository.save(nextCustomer);

        return new CompleteQueueResponse(
                currentCustomer,
                nextCustomer,
                "Customer completed. Next customer is now being served."
        );
    }
}