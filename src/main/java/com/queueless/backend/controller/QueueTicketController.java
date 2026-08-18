package com.queueless.backend.controller;

import com.queueless.backend.dto.CompleteQueueResponse;
import com.queueless.backend.entity.QueueStatus;
import com.queueless.backend.entity.QueueTicket;
import com.queueless.backend.service.QueueTicketService;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/queue")
public class QueueTicketController {

    private final QueueTicketService queueTicketService;

    public QueueTicketController(
            QueueTicketService queueTicketService
    ) {
        this.queueTicketService = queueTicketService;
    }

    // CUSTOMER can join a queue
    @PostMapping("/join")
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasRole('CUSTOMER')")
    public QueueTicket joinQueue(
            @RequestParam String customerName,
            @RequestParam Long serviceId
    ) {

        return queueTicketService.joinQueue(
                customerName,
                serviceId
        );
    }

    // Both CUSTOMER and STAFF can view the queue
    @GetMapping("/{serviceId}")
    public List<QueueTicket> getQueue(
            @PathVariable Long serviceId
    ) {

        return queueTicketService.getQueue(serviceId);
    }

    // Both can currently access a ticket
    @GetMapping("/ticket/{ticketId}")
    public QueueTicket getTicket(
            @PathVariable Long ticketId
    ) {

        return queueTicketService.getTicket(ticketId);
    }

    // STAFF only
    @PostMapping("/{serviceId}/next")
    @PreAuthorize("hasRole('STAFF')")
    public QueueTicket callNextCustomer(
            @PathVariable Long serviceId
    ) {

        return queueTicketService.callNextCustomer(serviceId);
    }

    // STAFF only
    @PutMapping("/ticket/{ticketId}/status")
    @PreAuthorize("hasRole('STAFF')")
    public QueueTicket updateStatus(
            @PathVariable Long ticketId,
            @RequestParam QueueStatus status
    ) {

        return queueTicketService.updateStatus(
                ticketId,
                status
        );
    }

    // Both can view queue position for now
    @GetMapping("/ticket/{ticketId}/position")
    public Map<String, Object> getQueuePosition(
            @PathVariable Long ticketId
    ) {

        int peopleAhead =
                queueTicketService.getPeopleAhead(ticketId);

        int estimatedWaitMinutes =
                queueTicketService.getEstimatedWaitTime(ticketId);

        Map<String, Object> response = new HashMap<>();

        response.put("peopleAhead", peopleAhead);
        response.put(
                "estimatedWaitMinutes",
                estimatedWaitMinutes
        );

        return response;
    }

    // Both can view dashboard data
    @GetMapping("/{serviceId}/dashboard")
    public Map<String, Object> getDashboard(
            @PathVariable Long serviceId
    ) {

        QueueTicket currentlyServing =
                queueTicketService.getCurrentlyServing(serviceId);

        QueueTicket nextWaiting =
                queueTicketService.getNextWaiting(serviceId);

        long waitingCount =
                queueTicketService.getWaitingCount(serviceId);

        Map<String, Object> response = new HashMap<>();

        response.put("currentlyServing", currentlyServing);
        response.put("nextWaiting", nextWaiting);
        response.put("waitingCount", waitingCount);

        return response;
    }

    // CUSTOMER can cancel; ownership will be added later
    @PutMapping("/ticket/{ticketId}/cancel")
    @PreAuthorize("hasRole('CUSTOMER')")
    public QueueTicket cancelTicket(
            @PathVariable Long ticketId
    ) {

        return queueTicketService.cancelTicket(ticketId);
    }

    // STAFF only
    @PostMapping("/{serviceId}/complete-current")
    @PreAuthorize("hasRole('STAFF')")
    public CompleteQueueResponse completeCurrentAndCallNext(
            @PathVariable Long serviceId
    ) {

        return queueTicketService.completeCurrentAndCallNext(
                serviceId
        );
    }
}