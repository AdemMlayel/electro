<?php

declare(strict_types=1);

namespace App;

use DateTimeImmutable;
use PDO;
use Throwable;

final class Api
{
    private const ALLOWED_STATUS_TRANSITIONS = [
        'pending' => ['assigned', 'cancelled'],
        'assigned' => ['in_progress', 'cancelled'],
        'in_progress' => ['completed', 'cancelled'],
        'completed' => [],
        'cancelled' => [],
    ];

    public function __construct(
        private readonly PDO $pdo,
        private readonly array $config
    ) {
    }

    public function dispatch(): void
    {
        $this->sendCorsHeaders();

        if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
            http_response_code(204);
            return;
        }

        $method = strtoupper($_SERVER['REQUEST_METHOD'] ?? 'GET');
        $path = parse_url($_SERVER['REQUEST_URI'] ?? '/', PHP_URL_PATH) ?: '/';

        try {
            if ($method === 'GET' && $path === '/') {
                $this->json(['status' => 'ok']);
                return;
            }

            if ($method === 'POST' && $path === '/api/v1/auth/register') {
                $this->register();
                return;
            }

            if ($method === 'POST' && $path === '/api/v1/auth/login') {
                $this->login();
                return;
            }

            if ($method === 'GET' && $path === '/api/v1/auth/me') {
                $this->json($this->normalizeUser($this->requireUser()));
                return;
            }

            if ($method === 'PUT' && $path === '/api/v1/auth/me') {
                $this->updateCurrentUser();
                return;
            }

            if ($method === 'POST' && $path === '/api/v1/auth/logout') {
                $this->json(['message' => 'Logged out successfully']);
                return;
            }

            if ($method === 'GET' && $path === '/api/v1/notifications') {
                $this->listNotifications();
                return;
            }

            if ($method === 'GET' && $path === '/api/v1/notifications/summary') {
                $this->notificationsSummary();
                return;
            }

            if ($method === 'POST' && $path === '/api/v1/notifications/read-all') {
                $this->markAllNotificationsRead();
                return;
            }

            if ($method === 'PATCH' && preg_match('#^/api/v1/notifications/([a-f0-9-]+?)/read$#i', $path, $matches)) {
                $this->markNotificationRead($matches[1]);
                return;
            }

            if ($method === 'GET' && $path === '/api/v1/conversations') {
                $this->listConversations();
                return;
            }

            if ($method === 'POST' && $path === '/api/v1/conversations') {
                $this->createOrGetConversation();
                return;
            }

            if ($method === 'GET' && preg_match('#^/api/v1/conversations/([a-f0-9-]+)$#i', $path, $matches)) {
                $this->getConversation($matches[1]);
                return;
            }

            if ($method === 'POST' && preg_match('#^/api/v1/conversations/([a-f0-9-]+)/messages$#i', $path, $matches)) {
                $this->sendConversationMessage($matches[1]);
                return;
            }

            if ($method === 'GET' && $path === '/api/v1/appliances') {
                $this->listAppliances();
                return;
            }

            if ($method === 'GET' && $path === '/api/v1/problem-types') {
                $this->listProblemTypes();
                return;
            }

            if ($method === 'POST' && $path === '/api/v1/tickets') {
                $this->createTicket();
                return;
            }

            if ($method === 'GET' && $path === '/api/v1/tickets') {
                $this->listUserTickets();
                return;
            }

            if ($method === 'GET' && preg_match('#^/api/v1/tickets/([a-f0-9-]+)$#i', $path, $matches)) {
                $this->getTicket($matches[1]);
                return;
            }

            if ($method === 'PATCH' && preg_match('#^/api/v1/tickets/([a-f0-9-]+)/status$#i', $path, $matches)) {
                $this->updateTicketStatus($matches[1]);
                return;
            }

            if ($method === 'PATCH' && preg_match('#^/api/v1/tickets/([a-f0-9-]+)/assign$#i', $path, $matches)) {
                $this->assignTicket($matches[1]);
                return;
            }

            if ($method === 'PUT' && preg_match('#^/api/v1/tickets/([a-f0-9-]+)$#i', $path, $matches)) {
                $this->updateTicket($matches[1]);
                return;
            }

            if ($method === 'DELETE' && preg_match('#^/api/v1/tickets/([a-f0-9-]+)$#i', $path, $matches)) {
                $this->deleteTicket($matches[1]);
                return;
            }

            if ($method === 'GET' && $path === '/api/v1/technician/tickets') {
                $this->technicianTickets();
                return;
            }

            if ($method === 'GET' && $path === '/api/v1/technician/unassigned') {
                $this->technicianUnassigned();
                return;
            }

            if ($method === 'POST' && preg_match('#^/api/v1/technician/tickets/([a-f0-9-]+)/claim$#i', $path, $matches)) {
                $this->claimTicket($matches[1]);
                return;
            }

            if ($method === 'GET' && preg_match('#^/api/v1/technician/tickets/([a-f0-9-]+)$#i', $path, $matches)) {
                $this->technicianTicket($matches[1]);
                return;
            }

            if ($method === 'POST' && preg_match('#^/api/v1/technician/tickets/([a-f0-9-]+)/unassign$#i', $path, $matches)) {
                $this->unassignTicket($matches[1]);
                return;
            }

            if ($method === 'GET' && $path === '/api/v1/admin/stats') {
                $this->adminStats();
                return;
            }

            if ($method === 'GET' && $path === '/api/v1/admin/users') {
                $this->adminUsers();
                return;
            }

            if ($method === 'GET' && preg_match('#^/api/v1/admin/users/([a-f0-9-]+)$#i', $path, $matches)) {
                $this->adminUser($matches[1]);
                return;
            }

            if ($method === 'PATCH' && preg_match('#^/api/v1/admin/users/([a-f0-9-]+)/role$#i', $path, $matches)) {
                $this->adminUpdateUserRole($matches[1]);
                return;
            }

            if ($method === 'PATCH' && preg_match('#^/api/v1/admin/users/([a-f0-9-]+)/status$#i', $path, $matches)) {
                $this->adminToggleUserStatus($matches[1]);
                return;
            }

            if ($method === 'PATCH' && preg_match('#^/api/v1/admin/users/([a-f0-9-]+)/promote$#i', $path, $matches)) {
                $this->adminPromoteUser($matches[1]);
                return;
            }

            if ($method === 'DELETE' && preg_match('#^/api/v1/admin/users/([a-f0-9-]+)$#i', $path, $matches)) {
                $this->adminDeleteUser($matches[1]);
                return;
            }

            if ($method === 'GET' && $path === '/api/v1/admin/tickets') {
                $this->adminTickets();
                return;
            }

            if ($method === 'PATCH' && preg_match('#^/api/v1/admin/tickets/([a-f0-9-]+)/status$#i', $path, $matches)) {
                $this->adminUpdateTicketStatus($matches[1]);
                return;
            }

            if ($method === 'GET' && $path === '/api/v1/admin/appliances') {
                $this->adminListAppliances();
                return;
            }

            if ($method === 'POST' && $path === '/api/v1/admin/appliances') {
                $this->adminCreateAppliance();
                return;
            }

            if ($method === 'PUT' && preg_match('#^/api/v1/admin/appliances/(\d+)$#', $path, $matches)) {
                $this->adminUpdateAppliance((int) $matches[1]);
                return;
            }

            if ($method === 'POST' && preg_match('#^/api/v1/admin/appliances/(\d+)/upload$#', $path, $matches)) {
                $this->adminUploadApplianceImage((int) $matches[1]);
                return;
            }

            if ($method === 'DELETE' && preg_match('#^/api/v1/admin/appliances/(\d+)$#', $path, $matches)) {
                $this->adminDeleteAppliance((int) $matches[1]);
                return;
            }

            if ($method === 'GET' && $path === '/api/v1/admin/problem-types') {
                $this->adminListProblemTypes();
                return;
            }

            if ($method === 'POST' && $path === '/api/v1/admin/problem-types') {
                $this->adminCreateProblemType();
                return;
            }

            if ($method === 'PUT' && preg_match('#^/api/v1/admin/problem-types/(\d+)$#', $path, $matches)) {
                $this->adminUpdateProblemType((int) $matches[1]);
                return;
            }

            if ($method === 'DELETE' && preg_match('#^/api/v1/admin/problem-types/(\d+)$#', $path, $matches)) {
                $this->adminDeleteProblemType((int) $matches[1]);
                return;
            }

            throw new ApiException('Not found', 404);
        } catch (ApiException $exception) {
            $this->error($exception->getMessage(), $exception->statusCode());
        } catch (Throwable $exception) {
            error_log($exception::class . ': ' . $exception->getMessage());
            error_log($exception->getTraceAsString());
            $this->error('Internal server error', 500);
        }
    }

    private function register(): void
    {
        $body = $this->jsonBody();
        $fullName = trim((string) ($body['full_name'] ?? ''));
        $email = strtolower(trim((string) ($body['email'] ?? '')));
        $password = (string) ($body['password'] ?? '');

        if ($fullName === '' || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
            throw new ApiException('Invalid registration payload', 400);
        }

        if (strlen($password) < 8 || strlen($password) > 72) {
            throw new ApiException('Password must be between 8 and 72 characters', 400);
        }

        $existing = $this->fetchOne('SELECT id FROM users WHERE email = :email', [':email' => $email]);
        if ($existing !== null) {
            throw new ApiException('User with this email already exists', 400);
        }

        $stmt = $this->pdo->prepare(
            'INSERT INTO users (full_name, email, password_hash, role, is_active) VALUES (:full_name, :email, :password_hash, :role, TRUE) RETURNING id, email'
        );
        $stmt->execute([
            ':full_name' => $fullName,
            ':email' => $email,
            ':password_hash' => password_hash($password, PASSWORD_BCRYPT),
            ':role' => 'user',
        ]);

        $user = $stmt->fetch();
        $this->json([
            'id' => (string) $user['id'],
            'email' => (string) $user['email'],
        ], 201);
    }

    private function login(): void
    {
        $body = $this->jsonBody();
        $email = strtolower(trim((string) ($body['email'] ?? '')));
        $password = (string) ($body['password'] ?? '');

        $user = $this->fetchOne('SELECT * FROM users WHERE email = :email', [':email' => $email]);
        if ($user === null || !$this->verifyPassword($password, (string) $user['password_hash'])) {
            throw new ApiException('Invalid credentials', 401);
        }

        if (!$this->toBool($user['is_active'])) {
            throw new ApiException('User account is inactive', 403);
        }

        $payload = [
            'sub' => (string) $user['id'],
            'role' => (string) $user['role'],
            'exp' => time() + ($this->config['auth']['access_token_expire_minutes'] * 60),
        ];

        $token = Jwt::encode($payload, $this->config['auth']['secret_key']);

        $this->json([
            'access_token' => $token,
            'token_type' => 'bearer',
        ]);
    }

    private function updateCurrentUser(): void
    {
        $user = $this->requireUser();
        $body = $this->jsonBody();

        $currentPassword = (string) ($body['current_password'] ?? '');
        if ($currentPassword === '' || !$this->verifyPassword($currentPassword, (string) $user['password_hash'])) {
            throw new ApiException('Current password is incorrect', 400);
        }

        $fields = [];
        $params = [':id' => $user['id']];

        if (array_key_exists('full_name', $body) && $body['full_name'] !== null) {
            $fields[] = 'full_name = :full_name';
            $params[':full_name'] = trim((string) $body['full_name']);
        }

        if (array_key_exists('phone', $body) && $body['phone'] !== null) {
            $fields[] = 'phone = :phone';
            $params[':phone'] = trim((string) $body['phone']);
        }

        if (array_key_exists('email', $body) && $body['email'] !== null) {
            $email = strtolower(trim((string) $body['email']));
            if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
                throw new ApiException('Invalid email address', 400);
            }

            $existing = $this->fetchOne(
                'SELECT id FROM users WHERE email = :email AND id <> :id',
                [':email' => $email, ':id' => $user['id']]
            );
            if ($existing !== null) {
                throw new ApiException('Email is already registered', 400);
            }

            $fields[] = 'email = :email';
            $params[':email'] = $email;
        }

        if (array_key_exists('new_password', $body) && $body['new_password'] !== null) {
            $newPassword = (string) $body['new_password'];
            if (strlen($newPassword) < 8 || strlen($newPassword) > 72) {
                throw new ApiException('New password must be between 8 and 72 characters', 400);
            }

            $fields[] = 'password_hash = :password_hash';
            $params[':password_hash'] = password_hash($newPassword, PASSWORD_BCRYPT);
        }

        if ($fields !== []) {
            $fields[] = 'updated_at = NOW()';
            $stmt = $this->pdo->prepare('UPDATE users SET ' . implode(', ', $fields) . ' WHERE id = :id');
            $stmt->execute($params);
        }

        $updated = $this->fetchUserById((string) $user['id']);
        $this->json($this->normalizeUser($updated));
    }

    private function listNotifications(): void
    {
        $user = $this->requireUser();
        $limit = $this->queryInt('limit', 30, 1, 100);
        $offset = $this->queryInt('offset', 0, 0, 100000);
        $unreadOnly = $this->toBool($this->query('unread_only') ?? false);

        $conditions = ['user_id = :user_id'];
        $params = [':user_id' => $user['id']];
        if ($unreadOnly) {
            $conditions[] = 'is_read = FALSE';
        }

        $whereSql = 'WHERE ' . implode(' AND ', $conditions);

        $countStmt = $this->pdo->prepare('SELECT COUNT(*) FROM notifications ' . $whereSql);
        $countStmt->execute($params);
        $total = (int) $countStmt->fetchColumn();

        $stmt = $this->pdo->prepare(
            'SELECT * FROM notifications ' . $whereSql . ' ORDER BY created_at DESC LIMIT :limit OFFSET :offset'
        );
        $stmt->bindValue(':user_id', (string) $user['id']);
        $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
        $stmt->bindValue(':offset', $offset, PDO::PARAM_INT);
        $stmt->execute();

        $items = $stmt->fetchAll();
        $unreadCount = (int) $this->fetchValue(
            'SELECT COUNT(*) FROM notifications WHERE user_id = :user_id AND is_read = FALSE',
            [':user_id' => $user['id']]
        );

        $this->json([
            'items' => array_map([$this, 'normalizeNotification'], $items),
            'total' => $total,
            'limit' => $limit,
            'offset' => $offset,
            'unread_count' => $unreadCount,
        ]);
    }

    private function notificationsSummary(): void
    {
        $user = $this->requireUser();
        $latest = $this->fetchAll(
            'SELECT * FROM notifications WHERE user_id = :user_id ORDER BY created_at DESC LIMIT 5',
            [':user_id' => $user['id']]
        );

        $this->json([
            'unread_total' => (int) $this->fetchValue(
                'SELECT COUNT(*) FROM notifications WHERE user_id = :user_id AND is_read = FALSE',
                [':user_id' => $user['id']]
            ),
            'unread_messages' => (int) $this->fetchValue(
                "SELECT COUNT(*) FROM notifications WHERE user_id = :user_id AND is_read = FALSE AND type = 'message'",
                [':user_id' => $user['id']]
            ),
            'unread_status' => (int) $this->fetchValue(
                "SELECT COUNT(*) FROM notifications WHERE user_id = :user_id AND is_read = FALSE AND type = 'ticket_status'",
                [':user_id' => $user['id']]
            ),
            'latest' => array_map([$this, 'normalizeNotification'], $latest),
        ]);
    }

    private function markNotificationRead(string $notificationId): void
    {
        $user = $this->requireUser();
        $notification = $this->fetchOne(
            'SELECT * FROM notifications WHERE id = :id AND user_id = :user_id',
            [':id' => $notificationId, ':user_id' => $user['id']]
        );

        if ($notification === null) {
            throw new ApiException('Notification not found', 404);
        }

        $stmt = $this->pdo->prepare('UPDATE notifications SET is_read = TRUE WHERE id = :id');
        $stmt->execute([':id' => $notificationId]);

        $updated = $this->fetchOne('SELECT * FROM notifications WHERE id = :id', [':id' => $notificationId]);
        $this->json($this->normalizeNotification($updated));
    }

    private function markAllNotificationsRead(): void
    {
        $user = $this->requireUser();
        $stmt = $this->pdo->prepare('UPDATE notifications SET is_read = TRUE WHERE user_id = :user_id AND is_read = FALSE');
        $stmt->execute([':user_id' => $user['id']]);

        $this->json(['message' => 'All notifications marked as read']);
    }

    private function listConversations(): void
    {
        $user = $this->requireUser();

        $roleCondition = (string) $user['role'] === 'technician'
            ? 'c.technician_id = :member_id'
            : 'c.client_id = :member_id';

        $rows = $this->fetchAll(<<<SQL
SELECT
    c.*,
    t.status AS ticket_status,
    t.description AS ticket_description,
    t.scheduled_date,
    a.name AS appliance_name,
    a.icon AS appliance_icon,
    client.full_name AS client_name,
    client.email AS client_email,
    client.phone AS client_phone,
    tech.full_name AS technician_name,
    tech.email AS technician_email,
    tech.phone AS technician_phone,
    (
        SELECT body
        FROM conversation_messages
        WHERE conversation_id = c.id
        ORDER BY created_at DESC
        LIMIT 1
    ) AS last_message_body,
    (
        SELECT created_at
        FROM conversation_messages
        WHERE conversation_id = c.id
        ORDER BY created_at DESC
        LIMIT 1
    ) AS last_message_created_at,
    (
        SELECT COUNT(*)
        FROM conversation_messages
        WHERE conversation_id = c.id
          AND sender_id <> :viewer_id
          AND is_read = FALSE
    ) AS unread_count
FROM conversations c
JOIN tickets t ON t.id = c.ticket_id
LEFT JOIN appliances a ON a.id = t.appliance_id
JOIN users client ON client.id = c.client_id
LEFT JOIN users tech ON tech.id = c.technician_id
WHERE {$roleCondition}
ORDER BY COALESCE(
    (
        SELECT created_at
        FROM conversation_messages
        WHERE conversation_id = c.id
        ORDER BY created_at DESC
        LIMIT 1
    ),
    c.updated_at
) DESC
SQL, [':viewer_id' => $user['id'], ':member_id' => $user['id']]);

        $eligibleTickets = $this->fetchEligibleConversationTickets((string) $user['id'], (string) $user['role']);

        $this->json([
            'items' => array_map([$this, 'normalizeConversation'], $rows),
            'eligible_tickets' => array_map([$this, 'normalizeTicket'], $eligibleTickets),
        ]);
    }

    private function createOrGetConversation(): void
    {
        $user = $this->requireRole(['user', 'technician']);
        $body = $this->jsonBody();
        $ticketId = (string) ($body['ticket_id'] ?? '');
        if ($ticketId === '') {
            throw new ApiException('Ticket id is required', 400);
        }

        $ticket = $this->fetchTicketById($ticketId);
        if ($ticket === null) {
            throw new ApiException('Ticket not found', 404);
        }

        $this->assertConversationAccess($ticket, $user);

        if ($ticket['technician_id'] === null) {
            throw new ApiException('Conversation becomes available after a technician is assigned', 400);
        }

        $conversationId = $this->syncConversationForTicket($ticket);
        $conversation = $this->fetchConversationById($conversationId);

        $this->json($this->normalizeConversation($conversation), 201);
    }

    private function getConversation(string $conversationId): void
    {
        $user = $this->requireRole(['user', 'technician']);
        $conversation = $this->fetchConversationById($conversationId);

        if ($conversation === null) {
            throw new ApiException('Conversation not found', 404);
        }

        $this->assertConversationMembership($conversation, (string) $user['id'], (string) $user['role']);
        $this->markConversationAsRead($conversationId, (string) $user['id']);

        $messages = $this->fetchAll(
            'SELECT * FROM conversation_messages WHERE conversation_id = :conversation_id ORDER BY created_at ASC',
            [':conversation_id' => $conversationId]
        );

        $updatedConversation = $this->fetchConversationById($conversationId);
        $this->json([
            'conversation' => $this->normalizeConversation($updatedConversation),
            'messages' => array_map([$this, 'normalizeConversationMessage'], $messages),
        ]);
    }

    private function sendConversationMessage(string $conversationId): void
    {
        $user = $this->requireRole(['user', 'technician']);
        $conversation = $this->fetchConversationById($conversationId);

        if ($conversation === null) {
            throw new ApiException('Conversation not found', 404);
        }

        $this->assertConversationMembership($conversation, (string) $user['id'], (string) $user['role']);

        $body = $this->jsonBody();
        $messageBody = trim((string) ($body['body'] ?? ''));
        if ($messageBody === '') {
            throw new ApiException('Message body is required', 400);
        }

        $stmt = $this->pdo->prepare(
            'INSERT INTO conversation_messages (conversation_id, sender_id, body) VALUES (:conversation_id, :sender_id, :body) RETURNING *'
        );
        $stmt->execute([
            ':conversation_id' => $conversationId,
            ':sender_id' => $user['id'],
            ':body' => $messageBody,
        ]);
        $message = $stmt->fetch();

        $updateConversation = $this->pdo->prepare('UPDATE conversations SET updated_at = NOW() WHERE id = :id');
        $updateConversation->execute([':id' => $conversationId]);

        $recipientId = (string) $conversation['client_id'] === (string) $user['id']
            ? ($conversation['technician_id'] !== null ? (string) $conversation['technician_id'] : null)
            : (string) $conversation['client_id'];

        if ($recipientId !== null) {
            $recipient = $this->fetchUserById($recipientId);
            if ($recipient !== null) {
                $senderName = (string) $user['full_name'];
                $preview = substr($messageBody, 0, 80);
                if (strlen($messageBody) > 80) {
                    $preview .= '...';
                }

                $this->createNotification(
                    $recipientId,
                    'New message from ' . $senderName,
                    $preview,
                    'message',
                    $this->conversationLinkForRole((string) $recipient['role'], $conversationId),
                    'conversation',
                    $conversationId
                );
            }
        }

        $this->json($this->normalizeConversationMessage($message), 201);
    }

    private function listAppliances(): void
    {
        $rows = $this->fetchAll('SELECT id, name, icon, image_url FROM appliances ORDER BY id');
        $this->json(array_map([$this, 'normalizeAppliance'], $rows));
    }

    private function listProblemTypes(): void
    {
        $params = [];
        $sql = 'SELECT id, appliance_id, label FROM problem_types';

        if ($this->query('appliance_id') !== null) {
            $sql .= ' WHERE appliance_id = :appliance_id';
            $params[':appliance_id'] = (int) $this->query('appliance_id');
        }

        $sql .= ' ORDER BY id';
        $rows = $this->fetchAll($sql, $params);
        $this->json(array_map([$this, 'normalizeProblemType'], $rows));
    }

    private function createTicket(): void
    {
        $user = $this->requireUser();
        $body = $this->jsonBody();

        $applianceId = (int) ($body['appliance_id'] ?? 0);
        $description = trim((string) ($body['description'] ?? ''));
        $address = trim((string) ($body['address'] ?? ''));
        $urgency = $body['urgency'] ?? null;

        if ($applianceId <= 0 || strlen($description) < 10 || $address === '') {
            throw new ApiException('Invalid ticket payload', 400);
        }

        if ($urgency !== null && !in_array($urgency, ['low', 'medium', 'high'], true)) {
            throw new ApiException('Invalid urgency value', 400);
        }

        $stmt = $this->pdo->prepare(<<<'SQL'
INSERT INTO tickets (
    user_id, appliance_id, problem_type_id, brand, model, description, urgency,
    phone, address, latitude, longitude, preferred_time_slot, scheduled_date, status, created_at, updated_at
)
VALUES (
    :user_id, :appliance_id, :problem_type_id, :brand, :model, :description, :urgency,
    :phone, :address, :latitude, :longitude, :preferred_time_slot, :scheduled_date, 'pending', NOW(), NOW()
)
RETURNING id, status
SQL);

        $stmt->execute([
            ':user_id' => $user['id'],
            ':appliance_id' => $applianceId,
            ':problem_type_id' => $this->nullableInt($body['problem_type_id'] ?? null),
            ':brand' => $this->nullableString($body['brand'] ?? null),
            ':model' => $this->nullableString($body['model'] ?? null),
            ':description' => $description,
            ':urgency' => $this->nullableString($urgency),
            ':phone' => $this->nullableString($body['phone'] ?? null),
            ':address' => $address,
            ':latitude' => $this->nullableFloat($body['latitude'] ?? null),
            ':longitude' => $this->nullableFloat($body['longitude'] ?? null),
            ':preferred_time_slot' => $this->nullableString($body['preferred_time_slot'] ?? null),
            ':scheduled_date' => $this->nullableString($body['scheduled_date'] ?? null),
        ]);

        $ticket = $stmt->fetch();
        $this->createStatusHistory((string) $ticket['id'], null, 'pending', (string) $user['id']);
        $createdTicket = $this->fetchTicketById((string) $ticket['id']);
        if ($createdTicket !== null) {
            $this->notifyTechniciansAboutPendingTicket($createdTicket);
        }

        $this->json([
            'id' => (string) $ticket['id'],
            'status' => (string) $ticket['status'],
        ], 201);
    }

    private function listUserTickets(): void
    {
        $user = $this->requireUser();
        $limit = $this->queryInt('limit', 20, 1, 100);
        $offset = $this->queryInt('offset', 0, 0, 100000);

        [$total, $items] = $this->fetchTickets(
            ['t.user_id = :user_id'],
            [':user_id' => $user['id']],
            $limit,
            $offset,
            [
                'status' => $this->query('status'),
                'urgency' => $this->query('urgency'),
                'appliance_id' => $this->query('appliance_id'),
            ]
        );

        $this->json([
            'items' => array_map([$this, 'normalizeTicket'], $items),
            'total' => $total,
            'limit' => $limit,
            'offset' => $offset,
        ]);
    }

    private function getTicket(string $ticketId): void
    {
        $user = $this->requireUser();
        $ticket = $this->fetchTicketById($ticketId);

        if ($ticket === null) {
            throw new ApiException('Ticket not found', 404);
        }

        if ((string) $ticket['user_id'] !== (string) $user['id']) {
            throw new ApiException('Access denied', 403);
        }

        $this->json($this->normalizeTicket($ticket));
    }

    private function updateTicketStatus(string $ticketId): void
    {
        $user = $this->requireUser();
        $ticket = $this->fetchTicketBaseById($ticketId);
        if ($ticket === null) {
            throw new ApiException('Ticket not found', 404);
        }

        $body = $this->jsonBody();
        $newStatus = (string) ($body['new_status'] ?? '');
        if (!in_array($newStatus, ['pending', 'assigned', 'in_progress', 'completed', 'cancelled'], true)) {
            throw new ApiException('Invalid status value', 400);
        }

        $role = (string) $user['role'];
        if ($role === 'user') {
            if ((string) $ticket['user_id'] !== (string) $user['id']) {
                throw new ApiException('Access denied', 403);
            }
            if ($newStatus !== 'cancelled') {
                throw new ApiException('Users can only cancel tickets', 403);
            }
        } elseif ($role === 'technician') {
            if ((string) ($ticket['technician_id'] ?? '') !== (string) $user['id']) {
                throw new ApiException('Access denied', 403);
            }
        }

        $updated = $this->transitionTicketStatus($ticket, $newStatus, (string) $user['id'], $role === 'admin');
        $this->json($this->normalizeTicket($updated));
    }

    private function assignTicket(string $ticketId): void
    {
        $currentUser = $this->requireRole(['technician', 'admin']);
        $ticket = $this->fetchTicketBaseById($ticketId);
        if ($ticket === null) {
            throw new ApiException('Ticket not found', 404);
        }

        $body = $this->jsonBody();
        $technicianId = (string) ($body['technician_id'] ?? '');
        $technician = $this->fetchOne(
            'SELECT id, role FROM users WHERE id = :id AND role = :role',
            [':id' => $technicianId, ':role' => 'technician']
        );

        if ($technician === null) {
            throw new ApiException('Invalid technician', 400);
        }

        if ((string) $ticket['status'] !== 'pending') {
            throw new ApiException('Only pending tickets can be assigned', 400);
        }

        $stmt = $this->pdo->prepare(
            'UPDATE tickets SET technician_id = :technician_id, status = :status, updated_at = NOW() WHERE id = :id'
        );
        $stmt->execute([
            ':technician_id' => $technicianId,
            ':status' => 'assigned',
            ':id' => $ticketId,
        ]);

        $this->createStatusHistory($ticketId, 'pending', 'assigned', (string) $currentUser['id']);
        $updated = $this->fetchTicketById($ticketId);
        if ($updated !== null) {
            $this->syncConversationForTicket($updated);
            $this->notifyAssignedTicket($updated, (string) $currentUser['id']);
        }
        $this->json($this->normalizeTicket($updated));
    }

    private function updateTicket(string $ticketId): void
    {
        $user = $this->requireUser();
        $ticket = $this->fetchTicketBaseById($ticketId);
        if ($ticket === null) {
            throw new ApiException('Ticket not found', 404);
        }

        if ((string) $ticket['user_id'] !== (string) $user['id']) {
            throw new ApiException('Access denied', 403);
        }

        if (in_array((string) $ticket['status'], ['completed', 'cancelled'], true)) {
            throw new ApiException('Cannot update completed or cancelled tickets', 400);
        }

        $body = $this->jsonBody();
        $fields = [];
        $params = [':id' => $ticketId];

        $mapping = [
            'appliance_id' => 'int',
            'problem_type_id' => 'int-null',
            'brand' => 'string-null',
            'model' => 'string-null',
            'description' => 'string-null',
            'urgency' => 'string-null',
            'phone' => 'string-null',
            'address' => 'string-null',
            'latitude' => 'float-null',
            'longitude' => 'float-null',
            'preferred_time_slot' => 'string-null',
            'scheduled_date' => 'string-null',
        ];

        foreach ($mapping as $column => $type) {
            if (!array_key_exists($column, $body)) {
                continue;
            }

            $fields[] = $column . ' = :' . $column;
            $params[':' . $column] = match ($type) {
                'int' => (int) $body[$column],
                'int-null' => $this->nullableInt($body[$column]),
                'float-null' => $this->nullableFloat($body[$column]),
                default => $this->nullableString($body[$column]),
            };
        }

        if ($fields === []) {
            $updated = $this->fetchTicketById($ticketId);
            $this->json($this->normalizeTicket($updated));
            return;
        }

        $fields[] = 'updated_at = NOW()';
        $stmt = $this->pdo->prepare('UPDATE tickets SET ' . implode(', ', $fields) . ' WHERE id = :id');
        $stmt->execute($params);

        $updated = $this->fetchTicketById($ticketId);
        $this->json($this->normalizeTicket($updated));
    }

    private function deleteTicket(string $ticketId): void
    {
        $user = $this->requireUser();
        $ticket = $this->fetchTicketBaseById($ticketId);
        if ($ticket === null) {
            throw new ApiException('Ticket not found', 404);
        }

        if ((string) $ticket['user_id'] !== (string) $user['id']) {
            throw new ApiException('Access denied', 403);
        }

        if ((string) $ticket['status'] !== 'pending') {
            throw new ApiException('Can only delete pending tickets', 400);
        }

        $stmt = $this->pdo->prepare('DELETE FROM tickets WHERE id = :id');
        $stmt->execute([':id' => $ticketId]);

        $this->json(['message' => 'Ticket deleted successfully']);
    }

    private function technicianTickets(): void
    {
        $user = $this->requireRole(['technician']);
        $limit = $this->queryInt('limit', 20, 1, 100);
        $offset = $this->queryInt('offset', 0, 0, 100000);

        [$total, $items] = $this->fetchTickets(
            ['t.technician_id = :technician_id'],
            [':technician_id' => $user['id']],
            $limit,
            $offset,
            [
                'status' => $this->query('status'),
                'urgency' => $this->query('urgency'),
            ]
        );

        $this->json([
            'items' => array_map([$this, 'normalizeTicket'], $items),
            'total' => $total,
            'limit' => $limit,
            'offset' => $offset,
        ]);
    }

    private function technicianUnassigned(): void
    {
        $this->requireRole(['technician']);
        $limit = $this->queryInt('limit', 20, 1, 100);
        $offset = $this->queryInt('offset', 0, 0, 100000);

        [$total, $items] = $this->fetchTickets(
            ['t.status = :pending_status', 't.technician_id IS NULL'],
            [':pending_status' => 'pending'],
            $limit,
            $offset,
            [
                'urgency' => $this->query('urgency'),
            ]
        );

        $this->json([
            'items' => array_map([$this, 'normalizeTicket'], $items),
            'total' => $total,
            'limit' => $limit,
            'offset' => $offset,
        ]);
    }

    private function claimTicket(string $ticketId): void
    {
        $user = $this->requireRole(['technician']);
        $ticket = $this->fetchTicketBaseById($ticketId);
        if ($ticket === null) {
            throw new ApiException('Ticket not found', 404);
        }

        if ((string) $ticket['status'] !== 'pending') {
            throw new ApiException('Only pending tickets can be claimed', 400);
        }

        if ($ticket['technician_id'] !== null) {
            throw new ApiException('Ticket is already assigned to a technician', 400);
        }

        $stmt = $this->pdo->prepare(
            'UPDATE tickets SET technician_id = :technician_id, status = :status, updated_at = NOW() WHERE id = :id'
        );
        $stmt->execute([
            ':technician_id' => $user['id'],
            ':status' => 'assigned',
            ':id' => $ticketId,
        ]);

        $this->createStatusHistory($ticketId, 'pending', 'assigned', (string) $user['id']);
        $updated = $this->fetchTicketById($ticketId);
        if ($updated !== null) {
            $this->syncConversationForTicket($updated);
            $this->notifyAssignedTicket($updated, (string) $user['id']);
        }
        $this->json([
            'message' => 'Ticket claimed successfully',
            'ticket' => $this->normalizeTicket($updated),
        ]);
    }

    private function technicianTicket(string $ticketId): void
    {
        $user = $this->requireRole(['technician']);
        $ticket = $this->fetchTicketById($ticketId);

        if ($ticket === null) {
            throw new ApiException('Ticket not found', 404);
        }

        if ($ticket['technician_id'] !== null && (string) $ticket['technician_id'] !== (string) $user['id']) {
            throw new ApiException('Access denied', 403);
        }

        $this->json($this->normalizeTicket($ticket));
    }

    private function unassignTicket(string $ticketId): void
    {
        $user = $this->requireRole(['technician']);
        $ticket = $this->fetchTicketBaseById($ticketId);
        if ($ticket === null) {
            throw new ApiException('Ticket not found', 404);
        }

        if ((string) ($ticket['technician_id'] ?? '') !== (string) $user['id']) {
            throw new ApiException('You can only unassign yourself from your own tickets', 403);
        }

        if (!in_array((string) $ticket['status'], ['assigned', 'in_progress'], true)) {
            throw new ApiException('Cannot unassign from completed or cancelled tickets', 400);
        }

        $oldStatus = (string) $ticket['status'];
        $stmt = $this->pdo->prepare(
            'UPDATE tickets SET technician_id = NULL, status = :status, updated_at = NOW() WHERE id = :id'
        );
        $stmt->execute([
            ':status' => 'pending',
            ':id' => $ticketId,
        ]);

        $this->createStatusHistory($ticketId, $oldStatus, 'pending', (string) $user['id']);
        $updated = $this->fetchTicketById($ticketId);
        if ($updated !== null) {
            $this->syncConversationForTicket($updated);
            $this->notifyTechniciansAboutPendingTicket($updated);
            $this->notifyTicketStatusChange($updated, 'pending', (string) $user['id']);
        }
        $this->json([
            'message' => 'Ticket unassigned successfully',
            'ticket' => $this->normalizeTicket($updated),
        ]);
    }

    private function adminStats(): void
    {
        $this->requireRole(['admin']);

        $this->json([
            'totalUsers' => (int) $this->fetchValue("SELECT COUNT(*) FROM users WHERE role = 'user'"),
            'totalTechnicians' => (int) $this->fetchValue("SELECT COUNT(*) FROM users WHERE role = 'technician'"),
            'totalTickets' => (int) $this->fetchValue('SELECT COUNT(*) FROM tickets'),
            'pendingTickets' => (int) $this->fetchValue("SELECT COUNT(*) FROM tickets WHERE status = 'pending'"),
            'completedTickets' => (int) $this->fetchValue("SELECT COUNT(*) FROM tickets WHERE status = 'completed'"),
            'totalAppliances' => (int) $this->fetchValue('SELECT COUNT(*) FROM appliances'),
        ]);
    }

    private function adminUsers(): void
    {
        $this->requireRole(['admin']);
        $rows = $this->fetchAll(
            'SELECT id, email, full_name, phone, role, is_active, created_at, updated_at FROM users ORDER BY created_at DESC'
        );
        $this->json(array_map([$this, 'normalizeUser'], $rows));
    }

    private function adminUser(string $userId): void
    {
        $this->requireRole(['admin']);
        $user = $this->fetchUserById($userId);
        if ($user === null) {
            throw new ApiException('User not found', 404);
        }

        $this->json($this->normalizeUser($user));
    }

    private function adminUpdateUserRole(string $userId): void
    {
        $this->requireRole(['admin']);
        $user = $this->fetchUserById($userId);
        if ($user === null) {
            throw new ApiException('User not found', 404);
        }

        $body = $this->jsonBody();
        $role = (string) ($body['role'] ?? '');
        if (!in_array($role, ['user', 'technician', 'admin'], true)) {
            throw new ApiException('Invalid role', 400);
        }

        $stmt = $this->pdo->prepare('UPDATE users SET role = :role, updated_at = NOW() WHERE id = :id');
        $stmt->execute([
            ':role' => $role,
            ':id' => $userId,
        ]);

        $updated = $this->fetchUserById($userId);
        $this->json([
            'message' => 'User role updated to ' . $role,
            'user' => $this->normalizeUser($updated),
        ]);
    }

    private function adminPromoteUser(string $userId): void
    {
        $this->requireRole(['admin']);
        $user = $this->fetchUserById($userId);
        if ($user === null) {
            throw new ApiException('User not found', 404);
        }

        $stmt = $this->pdo->prepare("UPDATE users SET role = 'technician', updated_at = NOW() WHERE id = :id");
        $stmt->execute([':id' => $userId]);

        $this->json(['message' => 'User promoted to technician']);
    }

    private function adminToggleUserStatus(string $userId): void
    {
        $this->requireRole(['admin']);
        $user = $this->fetchUserById($userId);
        if ($user === null) {
            throw new ApiException('User not found', 404);
        }

        $newStatus = !$this->toBool($user['is_active']);
        $stmt = $this->pdo->prepare('UPDATE users SET is_active = :is_active, updated_at = NOW() WHERE id = :id');
        $stmt->execute([
            ':is_active' => $newStatus,
            ':id' => $userId,
        ]);

        $this->json([
            'message' => 'User ' . ($newStatus ? 'activated' : 'deactivated'),
        ]);
    }

    private function adminDeleteUser(string $userId): void
    {
        $currentUser = $this->requireRole(['admin']);
        $user = $this->fetchUserById($userId);
        if ($user === null) {
            throw new ApiException('User not found', 404);
        }

        if ((string) $currentUser['id'] === $userId) {
            throw new ApiException('Cannot delete yourself', 400);
        }

        $stmt = $this->pdo->prepare('DELETE FROM users WHERE id = :id');
        $stmt->execute([':id' => $userId]);

        $this->json(['message' => 'User deleted successfully']);
    }

    private function adminTickets(): void
    {
        $this->requireRole(['admin']);
        $limit = $this->queryInt('limit', 50, 1, 200);
        $offset = $this->queryInt('offset', 0, 0, 100000);

        [$total, $items] = $this->fetchTickets(
            [],
            [],
            $limit,
            $offset,
            [
                'status' => $this->query('status'),
                'urgency' => $this->query('urgency'),
                'appliance_id' => $this->query('appliance_id'),
            ]
        );

        $this->json([
            'items' => array_map([$this, 'normalizeTicket'], $items),
            'total' => $total,
            'limit' => $limit,
            'offset' => $offset,
        ]);
    }

    private function adminUpdateTicketStatus(string $ticketId): void
    {
        $user = $this->requireRole(['admin']);
        $ticket = $this->fetchTicketBaseById($ticketId);
        if ($ticket === null) {
            throw new ApiException('Ticket not found', 404);
        }

        $body = $this->jsonBody();
        $newStatus = (string) ($body['new_status'] ?? '');
        if (!in_array($newStatus, ['pending', 'assigned', 'in_progress', 'completed', 'cancelled'], true)) {
            throw new ApiException('Invalid status value', 400);
        }

        $updated = $this->transitionTicketStatus($ticket, $newStatus, (string) $user['id'], true);
        $this->json($this->normalizeTicket($updated));
    }

    private function adminListAppliances(): void
    {
        $this->requireRole(['admin']);
        $this->listAppliances();
    }

    private function adminCreateAppliance(): void
    {
        $this->requireRole(['admin']);
        $body = $this->jsonBody();
        $name = trim((string) ($body['name'] ?? ''));
        $icon = $this->nullableString($body['icon'] ?? null);

        if ($name === '') {
            throw new ApiException('Appliance name is required', 400);
        }

        $existing = $this->fetchOne('SELECT id FROM appliances WHERE name = :name', [':name' => $name]);
        if ($existing !== null) {
            throw new ApiException('Appliance already exists', 400);
        }

        $stmt = $this->pdo->prepare('INSERT INTO appliances (name, icon) VALUES (:name, :icon) RETURNING id, name, icon, image_url');
        $stmt->execute([
            ':name' => $name,
            ':icon' => $icon,
        ]);

        $this->json($this->normalizeAppliance($stmt->fetch()));
    }

    private function adminUpdateAppliance(int $applianceId): void
    {
        $this->requireRole(['admin']);
        $appliance = $this->fetchOne('SELECT id, name, icon, image_url FROM appliances WHERE id = :id', [':id' => $applianceId]);
        if ($appliance === null) {
            throw new ApiException('Appliance not found', 404);
        }

        $body = $this->jsonBody();
        $fields = [];
        $params = [':id' => $applianceId];

        if (array_key_exists('name', $body) && $body['name'] !== null) {
            $fields[] = 'name = :name';
            $params[':name'] = trim((string) $body['name']);
        }
        if (array_key_exists('icon', $body)) {
            $fields[] = 'icon = :icon';
            $params[':icon'] = $this->nullableString($body['icon']);
        }
        if (array_key_exists('image_url', $body)) {
            $fields[] = 'image_url = :image_url';
            $params[':image_url'] = $this->nullableString($body['image_url']);
        }

        if ($fields !== []) {
            $stmt = $this->pdo->prepare('UPDATE appliances SET ' . implode(', ', $fields) . ' WHERE id = :id');
            $stmt->execute($params);
        }

        $updated = $this->fetchOne('SELECT id, name, icon, image_url FROM appliances WHERE id = :id', [':id' => $applianceId]);
        $this->json($this->normalizeAppliance($updated));
    }

    private function adminUploadApplianceImage(int $applianceId): void
    {
        $this->requireRole(['admin']);
        $appliance = $this->fetchOne('SELECT id, name, icon, image_url FROM appliances WHERE id = :id', [':id' => $applianceId]);
        if ($appliance === null) {
            throw new ApiException('Appliance not found', 404);
        }

        $upload = $_FILES['file'] ?? $_FILES['image'] ?? null;
        if (!is_array($upload) || ($upload['error'] ?? UPLOAD_ERR_NO_FILE) !== UPLOAD_ERR_OK) {
            throw new ApiException('No upload file received', 400);
        }

        $mimeType = null;
        if (function_exists('finfo_open')) {
            $finfo = finfo_open(FILEINFO_MIME_TYPE);
            if ($finfo !== false) {
                $mimeType = finfo_file($finfo, $upload['tmp_name']);
                finfo_close($finfo);
            }
        }

        $allowed = [
            'image/jpeg' => 'jpg',
            'image/png' => 'png',
            'image/webp' => 'webp',
            'image/gif' => 'gif',
        ];

        if ($mimeType === null || !isset($allowed[$mimeType])) {
            throw new ApiException('Only JPG, PNG, WEBP, and GIF uploads are allowed', 400);
        }

        $directory = $this->config['storage']['path'] . '/appliances';
        if (!is_dir($directory) && !mkdir($directory, 0777, true) && !is_dir($directory)) {
            throw new ApiException('Could not create upload directory', 500);
        }

        $fileName = sprintf('appliance_%d_%s.%s', $applianceId, bin2hex(random_bytes(8)), $allowed[$mimeType]);
        $destination = $directory . '/' . $fileName;

        if (!move_uploaded_file($upload['tmp_name'], $destination)) {
            throw new ApiException('Failed to store uploaded file', 500);
        }

        $imageUrl = '/uploads/appliances/' . $fileName;
        $stmt = $this->pdo->prepare('UPDATE appliances SET image_url = :image_url WHERE id = :id');
        $stmt->execute([
            ':image_url' => $imageUrl,
            ':id' => $applianceId,
        ]);

        $updated = $this->fetchOne('SELECT id, name, icon, image_url FROM appliances WHERE id = :id', [':id' => $applianceId]);
        $this->json($this->normalizeAppliance($updated));
    }

    private function adminDeleteAppliance(int $applianceId): void
    {
        $this->requireRole(['admin']);
        $appliance = $this->fetchOne('SELECT id FROM appliances WHERE id = :id', [':id' => $applianceId]);
        if ($appliance === null) {
            throw new ApiException('Appliance not found', 404);
        }

        $stmt = $this->pdo->prepare('DELETE FROM appliances WHERE id = :id');
        $stmt->execute([':id' => $applianceId]);

        $this->json(['message' => 'Appliance deleted successfully']);
    }

    private function adminListProblemTypes(): void
    {
        $this->requireRole(['admin']);
        $this->listProblemTypes();
    }

    private function adminCreateProblemType(): void
    {
        $this->requireRole(['admin']);
        $body = $this->jsonBody();
        $applianceId = (int) ($body['appliance_id'] ?? 0);
        $label = trim((string) ($body['label'] ?? ''));

        if ($applianceId <= 0 || $label === '') {
            throw new ApiException('Invalid problem type payload', 400);
        }

        $appliance = $this->fetchOne('SELECT id FROM appliances WHERE id = :id', [':id' => $applianceId]);
        if ($appliance === null) {
            throw new ApiException('Appliance not found', 404);
        }

        $existing = $this->fetchOne(
            'SELECT id FROM problem_types WHERE appliance_id = :appliance_id AND label = :label',
            [':appliance_id' => $applianceId, ':label' => $label]
        );
        if ($existing !== null) {
            throw new ApiException('Problem type already exists for this appliance', 400);
        }

        $stmt = $this->pdo->prepare(
            'INSERT INTO problem_types (appliance_id, label) VALUES (:appliance_id, :label) RETURNING id, appliance_id, label'
        );
        $stmt->execute([
            ':appliance_id' => $applianceId,
            ':label' => $label,
        ]);

        $this->json($this->normalizeProblemType($stmt->fetch()));
    }

    private function adminUpdateProblemType(int $problemTypeId): void
    {
        $this->requireRole(['admin']);
        $problemType = $this->fetchOne(
            'SELECT id, appliance_id, label FROM problem_types WHERE id = :id',
            [':id' => $problemTypeId]
        );
        if ($problemType === null) {
            throw new ApiException('Problem type not found', 404);
        }

        $body = $this->jsonBody();
        $fields = [];
        $params = [':id' => $problemTypeId];

        if (array_key_exists('label', $body) && $body['label'] !== null) {
            $fields[] = 'label = :label';
            $params[':label'] = trim((string) $body['label']);
        }

        if (array_key_exists('appliance_id', $body) && $body['appliance_id'] !== null) {
            $applianceId = (int) $body['appliance_id'];
            $appliance = $this->fetchOne('SELECT id FROM appliances WHERE id = :id', [':id' => $applianceId]);
            if ($appliance === null) {
                throw new ApiException('Appliance not found', 404);
            }

            $fields[] = 'appliance_id = :appliance_id';
            $params[':appliance_id'] = $applianceId;
        }

        if ($fields !== []) {
            $stmt = $this->pdo->prepare('UPDATE problem_types SET ' . implode(', ', $fields) . ' WHERE id = :id');
            $stmt->execute($params);
        }

        $updated = $this->fetchOne(
            'SELECT id, appliance_id, label FROM problem_types WHERE id = :id',
            [':id' => $problemTypeId]
        );
        $this->json($this->normalizeProblemType($updated));
    }

    private function adminDeleteProblemType(int $problemTypeId): void
    {
        $this->requireRole(['admin']);
        $problemType = $this->fetchOne('SELECT id FROM problem_types WHERE id = :id', [':id' => $problemTypeId]);
        if ($problemType === null) {
            throw new ApiException('Problem type not found', 404);
        }

        $stmt = $this->pdo->prepare('DELETE FROM problem_types WHERE id = :id');
        $stmt->execute([':id' => $problemTypeId]);

        $this->json(['message' => 'Problem type deleted successfully']);
    }

    private function requireUser(): array
    {
        $token = $this->bearerToken();
        if ($token === null || $token === '') {
            throw new ApiException('Could not validate credentials', 401);
        }

        $payload = Jwt::decode($token, $this->config['auth']['secret_key']);
        $user = $this->fetchOne('SELECT * FROM users WHERE id = :id', [':id' => $payload['sub']]);
        if ($user === null) {
            throw new ApiException('Could not validate credentials', 401);
        }

        if (!$this->toBool($user['is_active'])) {
            throw new ApiException('User account is inactive', 403);
        }

        return $user;
    }

    private function requireRole(array $roles): array
    {
        $user = $this->requireUser();
        if (!in_array((string) $user['role'], $roles, true)) {
            throw new ApiException('Access denied', 403);
        }

        return $user;
    }

    private function bearerToken(): ?string
    {
        if (!empty($_COOKIE['access_token'])) {
            return (string) $_COOKIE['access_token'];
        }

        $header = $_SERVER['HTTP_AUTHORIZATION'] ?? $_SERVER['Authorization'] ?? '';
        if (is_string($header) && str_starts_with($header, 'Bearer ')) {
            return substr($header, 7);
        }

        return null;
    }

    private function transitionTicketStatus(array $ticket, string $newStatus, string $changedBy, bool $skipTransitionCheck): array
    {
        $currentStatus = (string) $ticket['status'];
        if (!$skipTransitionCheck) {
            $allowed = self::ALLOWED_STATUS_TRANSITIONS[$currentStatus] ?? [];
            if (!in_array($newStatus, $allowed, true)) {
                throw new ApiException(
                    sprintf("Invalid status transition from '%s' to '%s'", $currentStatus, $newStatus),
                    400
                );
            }
        }

        $stmt = $this->pdo->prepare('UPDATE tickets SET status = :status, updated_at = NOW() WHERE id = :id');
        $stmt->execute([
            ':status' => $newStatus,
            ':id' => $ticket['id'],
        ]);

        $this->createStatusHistory((string) $ticket['id'], $currentStatus, $newStatus, $changedBy);

        $updated = $this->fetchTicketById((string) $ticket['id']);
        if ($updated !== null) {
            $this->syncConversationForTicket($updated);
            $this->notifyTicketStatusChange($updated, $newStatus, $changedBy);
        }
        return $updated ?? $ticket;
    }

    private function createNotification(
        string $userId,
        string $title,
        string $body,
        string $type = 'system',
        ?string $link = null,
        ?string $entityType = null,
        ?string $entityId = null
    ): void {
        $stmt = $this->pdo->prepare(<<<'SQL'
INSERT INTO notifications (user_id, type, title, body, link, entity_type, entity_id)
VALUES (:user_id, :type, :title, :body, :link, :entity_type, :entity_id)
SQL);
        $stmt->execute([
            ':user_id' => $userId,
            ':type' => $type,
            ':title' => $title,
            ':body' => $body,
            ':link' => $link,
            ':entity_type' => $entityType,
            ':entity_id' => $entityId,
        ]);
    }

    private function notifyTechniciansAboutPendingTicket(array $ticket): void
    {
        $technicians = $this->fetchAll(
            "SELECT id FROM users WHERE role = 'technician' AND is_active = TRUE"
        );

        $applianceName = (string) ($ticket['appliance_name'] ?? 'Appliance repair');
        $urgency = $ticket['urgency'] !== null ? ' (' . (string) $ticket['urgency'] . ' urgency)' : '';

        foreach ($technicians as $technician) {
            $this->createNotification(
                (string) $technician['id'],
                'New unassigned ticket available',
                $applianceName . ' ticket is waiting for a technician' . $urgency,
                'ticket_unassigned',
                '/technician/unassigned',
                'ticket',
                (string) $ticket['id']
            );
        }
    }

    private function notifyAssignedTicket(array $ticket, string $changedBy): void
    {
        $ticketId = (string) $ticket['id'];
        $applianceName = (string) ($ticket['appliance_name'] ?? 'Service request');
        $clientId = (string) $ticket['user_id'];
        $technicianId = $ticket['technician_id'] !== null ? (string) $ticket['technician_id'] : null;
        $conversationId = $this->findConversationIdByTicket($ticketId);

        if ($clientId !== $changedBy) {
            $this->createNotification(
                $clientId,
                'Your ticket was accepted',
                $applianceName . ' ticket has been accepted by a technician.',
                'ticket_status',
                $conversationId !== null ? $this->conversationLinkForRole('user', $conversationId) : '/dashboard/profile',
                'ticket',
                $ticketId
            );
        }

        if ($technicianId !== null && $technicianId !== $changedBy) {
            $this->createNotification(
                $technicianId,
                'Ticket assigned to you',
                $applianceName . ' ticket is now assigned to you.',
                'ticket_status',
                $conversationId !== null ? $this->conversationLinkForRole('technician', $conversationId) : '/technician',
                'ticket',
                $ticketId
            );
        }
    }

    private function notifyTicketStatusChange(array $ticket, string $newStatus, string $changedBy): void
    {
        $ticketId = (string) $ticket['id'];
        $clientId = (string) $ticket['user_id'];
        $technicianId = $ticket['technician_id'] !== null ? (string) $ticket['technician_id'] : null;
        $applianceName = (string) ($ticket['appliance_name'] ?? 'Service request');
        $conversationId = $this->findConversationIdByTicket($ticketId);

        $title = match ($newStatus) {
            'assigned' => $technicianId !== null ? 'Your ticket was accepted' : 'Ticket status updated',
            'in_progress' => 'Repair is now in progress',
            'completed' => 'Repair completed',
            'cancelled' => 'Ticket rejected or cancelled',
            'pending' => 'Ticket is pending technician assignment',
            default => 'Ticket updated',
        };

        $body = match ($newStatus) {
            'assigned' => $technicianId !== null
                ? $applianceName . ' ticket has been accepted by a technician.'
                : $applianceName . ' ticket status changed to assigned.',
            'in_progress' => $applianceName . ' repair is now being worked on.',
            'completed' => $applianceName . ' repair has been marked as completed.',
            'cancelled' => $applianceName . ' ticket was rejected or cancelled.',
            'pending' => $applianceName . ' ticket is currently waiting for a technician.',
            default => $applianceName . ' ticket status changed to ' . $newStatus . '.',
        };

        if ($clientId !== $changedBy) {
            $this->createNotification(
                $clientId,
                $title,
                $body,
                'ticket_status',
                $conversationId !== null ? $this->conversationLinkForRole('user', $conversationId) : '/dashboard/profile',
                'ticket',
                $ticketId
            );
        }

        if ($technicianId !== null && $technicianId !== $changedBy && in_array($newStatus, ['cancelled', 'completed'], true)) {
            $this->createNotification(
                $technicianId,
                'Ticket status updated',
                $applianceName . ' ticket status changed to ' . str_replace('_', ' ', $newStatus) . '.',
                'ticket_status',
                $conversationId !== null ? $this->conversationLinkForRole('technician', $conversationId) : '/technician',
                'ticket',
                $ticketId
            );
        }
    }

    private function fetchEligibleConversationTickets(string $userId, string $role): array
    {
        $condition = $role === 'technician' ? 't.technician_id = :user_id' : 't.user_id = :user_id';

        return $this->fetchAll(<<<SQL
SELECT
    t.*,
    u.full_name AS user_name,
    u.email AS user_email,
    u.phone AS user_phone,
    tech.full_name AS technician_name,
    tech.email AS technician_email,
    tech.phone AS technician_phone,
    a.name AS appliance_name,
    a.icon AS appliance_icon,
    pt.label AS problem_type_label
FROM tickets t
JOIN users u ON u.id = t.user_id
LEFT JOIN users tech ON tech.id = t.technician_id
LEFT JOIN appliances a ON a.id = t.appliance_id
LEFT JOIN problem_types pt ON pt.id = t.problem_type_id
WHERE {$condition}
  AND t.technician_id IS NOT NULL
ORDER BY COALESCE(t.updated_at, t.created_at) DESC
SQL, [':user_id' => $userId]);
    }

    private function assertConversationAccess(array $ticket, array $user): void
    {
        $role = (string) $user['role'];
        $userId = (string) $user['id'];

        if ($role === 'user' && (string) $ticket['user_id'] !== $userId) {
            throw new ApiException('Access denied', 403);
        }

        if ($role === 'technician' && (string) ($ticket['technician_id'] ?? '') !== $userId) {
            throw new ApiException('Access denied', 403);
        }
    }

    private function syncConversationForTicket(array $ticket): ?string
    {
        $ticketId = (string) $ticket['id'];
        $existing = $this->fetchOne('SELECT id FROM conversations WHERE ticket_id = :ticket_id', [':ticket_id' => $ticketId]);

        if ($existing === null) {
            $stmt = $this->pdo->prepare(<<<'SQL'
INSERT INTO conversations (ticket_id, client_id, technician_id, created_at, updated_at)
VALUES (:ticket_id, :client_id, :technician_id, NOW(), NOW())
RETURNING id
SQL);
            $stmt->execute([
                ':ticket_id' => $ticketId,
                ':client_id' => $ticket['user_id'],
                ':technician_id' => $ticket['technician_id'],
            ]);

            $created = $stmt->fetch();
            return $created !== false ? (string) $created['id'] : null;
        }

        $stmt = $this->pdo->prepare(
            'UPDATE conversations SET client_id = :client_id, technician_id = :technician_id, updated_at = NOW() WHERE ticket_id = :ticket_id'
        );
        $stmt->execute([
            ':client_id' => $ticket['user_id'],
            ':technician_id' => $ticket['technician_id'],
            ':ticket_id' => $ticketId,
        ]);

        return (string) $existing['id'];
    }

    private function fetchConversationById(string $conversationId): ?array
    {
        return $this->fetchOne(<<<'SQL'
SELECT
    c.*,
    t.status AS ticket_status,
    t.description AS ticket_description,
    t.scheduled_date,
    a.name AS appliance_name,
    a.icon AS appliance_icon,
    client.full_name AS client_name,
    client.email AS client_email,
    client.phone AS client_phone,
    tech.full_name AS technician_name,
    tech.email AS technician_email,
    tech.phone AS technician_phone,
    last_message.body AS last_message_body,
    last_message.created_at AS last_message_created_at
FROM conversations c
JOIN tickets t ON t.id = c.ticket_id
LEFT JOIN appliances a ON a.id = t.appliance_id
JOIN users client ON client.id = c.client_id
LEFT JOIN users tech ON tech.id = c.technician_id
LEFT JOIN LATERAL (
    SELECT body, created_at
    FROM conversation_messages
    WHERE conversation_id = c.id
    ORDER BY created_at DESC
    LIMIT 1
) last_message ON TRUE
WHERE c.id = :id
SQL, [':id' => $conversationId]);
    }

    private function findConversationIdByTicket(string $ticketId): ?string
    {
        $conversation = $this->fetchOne(
            'SELECT id FROM conversations WHERE ticket_id = :ticket_id',
            [':ticket_id' => $ticketId]
        );

        return $conversation !== null ? (string) $conversation['id'] : null;
    }

    private function assertConversationMembership(array $conversation, string $userId, string $role): void
    {
        if ($role === 'user' && (string) $conversation['client_id'] !== $userId) {
            throw new ApiException('Access denied', 403);
        }

        if ($role === 'technician' && (string) ($conversation['technician_id'] ?? '') !== $userId) {
            throw new ApiException('Access denied', 403);
        }
    }

    private function markConversationAsRead(string $conversationId, string $userId): void
    {
        $stmt = $this->pdo->prepare(
            'UPDATE conversation_messages SET is_read = TRUE WHERE conversation_id = :conversation_id AND sender_id <> :user_id AND is_read = FALSE'
        );
        $stmt->execute([
            ':conversation_id' => $conversationId,
            ':user_id' => $userId,
        ]);

        $notificationStmt = $this->pdo->prepare(
            "UPDATE notifications SET is_read = TRUE WHERE user_id = :user_id AND entity_type = 'conversation' AND entity_id = :conversation_id AND is_read = FALSE"
        );
        $notificationStmt->execute([
            ':user_id' => $userId,
            ':conversation_id' => $conversationId,
        ]);
    }

    private function conversationLinkForRole(string $role, string $conversationId): string
    {
        $base = $role === 'technician' ? '/technician' : '/dashboard';
        return $base . '/conversations/' . $conversationId;
    }

    private function fetchTickets(
        array $baseConditions,
        array $baseParams,
        int $limit,
        int $offset,
        array $filters
    ): array {
        $conditions = $baseConditions;
        $params = $baseParams;

        if (!empty($filters['status'])) {
            $conditions[] = 't.status = :status';
            $params[':status'] = (string) $filters['status'];
        }

        if (!empty($filters['urgency'])) {
            $conditions[] = 't.urgency = :urgency';
            $params[':urgency'] = (string) $filters['urgency'];
        }

        if (!empty($filters['appliance_id'])) {
            $conditions[] = 't.appliance_id = :appliance_id';
            $params[':appliance_id'] = (int) $filters['appliance_id'];
        }

        $whereSql = $conditions === [] ? '' : 'WHERE ' . implode(' AND ', $conditions);

        $countStmt = $this->pdo->prepare('SELECT COUNT(*) FROM tickets t ' . $whereSql);
        $countStmt->execute($params);
        $total = (int) $countStmt->fetchColumn();

        $sql = <<<SQL
SELECT
    t.*,
    u.full_name AS user_name,
    u.email AS user_email,
    u.phone AS user_phone,
    tech.full_name AS technician_name,
    tech.email AS technician_email,
    tech.phone AS technician_phone,
    a.name AS appliance_name,
    a.icon AS appliance_icon,
    pt.label AS problem_type_label
FROM tickets t
JOIN users u ON u.id = t.user_id
LEFT JOIN users tech ON tech.id = t.technician_id
LEFT JOIN appliances a ON a.id = t.appliance_id
LEFT JOIN problem_types pt ON pt.id = t.problem_type_id
{$whereSql}
ORDER BY t.created_at DESC
LIMIT :limit OFFSET :offset
SQL;

        $stmt = $this->pdo->prepare($sql);
        foreach ($params as $key => $value) {
            $stmt->bindValue($key, $value);
        }
        $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
        $stmt->bindValue(':offset', $offset, PDO::PARAM_INT);
        $stmt->execute();

        return [$total, $stmt->fetchAll()];
    }

    private function fetchTicketById(string $ticketId): ?array
    {
        return $this->fetchOne(<<<'SQL'
SELECT
    t.*,
    u.full_name AS user_name,
    u.email AS user_email,
    u.phone AS user_phone,
    tech.full_name AS technician_name,
    tech.email AS technician_email,
    tech.phone AS technician_phone,
    a.name AS appliance_name,
    a.icon AS appliance_icon,
    pt.label AS problem_type_label
FROM tickets t
JOIN users u ON u.id = t.user_id
LEFT JOIN users tech ON tech.id = t.technician_id
LEFT JOIN appliances a ON a.id = t.appliance_id
LEFT JOIN problem_types pt ON pt.id = t.problem_type_id
WHERE t.id = :id
SQL, [':id' => $ticketId]);
    }

    private function fetchTicketBaseById(string $ticketId): ?array
    {
        return $this->fetchOne('SELECT * FROM tickets WHERE id = :id', [':id' => $ticketId]);
    }

    private function fetchUserById(string $userId): ?array
    {
        return $this->fetchOne(
            'SELECT id, email, full_name, phone, role, is_active, created_at, updated_at FROM users WHERE id = :id',
            [':id' => $userId]
        );
    }

    private function fetchValue(string $sql, array $params = []): mixed
    {
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute($params);
        return $stmt->fetchColumn();
    }

    private function fetchOne(string $sql, array $params = []): ?array
    {
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute($params);
        $row = $stmt->fetch();
        return $row === false ? null : $row;
    }

    private function fetchAll(string $sql, array $params = []): array
    {
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute($params);
        return $stmt->fetchAll();
    }

    private function createStatusHistory(string $ticketId, ?string $oldStatus, string $newStatus, ?string $changedBy): void
    {
        $stmt = $this->pdo->prepare(
            'INSERT INTO ticket_status_history (ticket_id, old_status, new_status, changed_by) VALUES (:ticket_id, :old_status, :new_status, :changed_by)'
        );
        $stmt->execute([
            ':ticket_id' => $ticketId,
            ':old_status' => $oldStatus,
            ':new_status' => $newStatus,
            ':changed_by' => $changedBy,
        ]);
    }

    private function verifyPassword(string $plainPassword, string $storedHash): bool
    {
        if ($plainPassword === '' || $storedHash === '') {
            return false;
        }

        if (str_starts_with($storedHash, '$2y$') || str_starts_with($storedHash, '$2b$') || str_starts_with($storedHash, '$argon2')) {
            return password_verify($plainPassword, $storedHash);
        }

        return false;
    }

    private function normalizeUser(array $user): array
    {
        return [
            'id' => (string) $user['id'],
            'email' => (string) $user['email'],
            'full_name' => (string) $user['full_name'],
            'phone' => $user['phone'] !== null ? (string) $user['phone'] : null,
            'role' => (string) $user['role'],
            'is_active' => $this->toBool($user['is_active']),
        ];
    }

    private function normalizeAppliance(array $appliance): array
    {
        return [
            'id' => (int) $appliance['id'],
            'name' => (string) $appliance['name'],
            'icon' => $appliance['icon'] !== null ? (string) $appliance['icon'] : null,
            'image_url' => $appliance['image_url'] !== null ? (string) $appliance['image_url'] : null,
        ];
    }

    private function normalizeProblemType(array $problemType): array
    {
        return [
            'id' => (int) $problemType['id'],
            'appliance_id' => (int) $problemType['appliance_id'],
            'label' => (string) $problemType['label'],
        ];
    }

    private function normalizeNotification(array $notification): array
    {
        return [
            'id' => (string) $notification['id'],
            'type' => (string) $notification['type'],
            'title' => (string) $notification['title'],
            'body' => (string) $notification['body'],
            'link' => $notification['link'] !== null ? (string) $notification['link'] : null,
            'entity_type' => $notification['entity_type'] !== null ? (string) $notification['entity_type'] : null,
            'entity_id' => $notification['entity_id'] !== null ? (string) $notification['entity_id'] : null,
            'is_read' => $this->toBool($notification['is_read']),
            'created_at' => $this->formatDate($notification['created_at'] ?? null),
        ];
    }

    private function normalizeConversation(array $conversation): array
    {
        return [
            'id' => (string) $conversation['id'],
            'ticket_id' => (string) $conversation['ticket_id'],
            'client_id' => (string) $conversation['client_id'],
            'technician_id' => $conversation['technician_id'] !== null ? (string) $conversation['technician_id'] : null,
            'ticket_status' => $conversation['ticket_status'] !== null ? (string) $conversation['ticket_status'] : null,
            'ticket_description' => $conversation['ticket_description'] !== null ? (string) $conversation['ticket_description'] : null,
            'scheduled_date' => $this->formatDate($conversation['scheduled_date'] ?? null),
            'appliance_name' => $conversation['appliance_name'] ?? null,
            'appliance_icon' => $conversation['appliance_icon'] ?? null,
            'client_name' => $conversation['client_name'] ?? null,
            'client_email' => $conversation['client_email'] ?? null,
            'client_phone' => $conversation['client_phone'] ?? null,
            'technician_name' => $conversation['technician_name'] ?? null,
            'technician_email' => $conversation['technician_email'] ?? null,
            'technician_phone' => $conversation['technician_phone'] ?? null,
            'last_message_body' => $conversation['last_message_body'] ?? null,
            'last_message_created_at' => $this->formatDate($conversation['last_message_created_at'] ?? null),
            'unread_count' => isset($conversation['unread_count']) ? (int) $conversation['unread_count'] : 0,
            'created_at' => $this->formatDate($conversation['created_at'] ?? null),
            'updated_at' => $this->formatDate($conversation['updated_at'] ?? null),
        ];
    }

    private function normalizeConversationMessage(array $message): array
    {
        return [
            'id' => (string) $message['id'],
            'conversation_id' => (string) $message['conversation_id'],
            'sender_id' => (string) $message['sender_id'],
            'body' => (string) $message['body'],
            'is_read' => $this->toBool($message['is_read']),
            'created_at' => $this->formatDate($message['created_at'] ?? null),
        ];
    }

    private function normalizeTicket(array $ticket): array
    {
        return [
            'id' => (string) $ticket['id'],
            'user_id' => isset($ticket['user_id']) ? (string) $ticket['user_id'] : null,
            'technician_id' => $ticket['technician_id'] !== null ? (string) $ticket['technician_id'] : null,
            'appliance_id' => (int) $ticket['appliance_id'],
            'problem_type_id' => $ticket['problem_type_id'] !== null ? (int) $ticket['problem_type_id'] : null,
            'brand' => $ticket['brand'] !== null ? (string) $ticket['brand'] : null,
            'model' => $ticket['model'] !== null ? (string) $ticket['model'] : null,
            'description' => (string) $ticket['description'],
            'urgency' => $ticket['urgency'] !== null ? (string) $ticket['urgency'] : null,
            'status' => (string) $ticket['status'],
            'phone' => $ticket['phone'] !== null ? (string) $ticket['phone'] : null,
            'address' => (string) $ticket['address'],
            'latitude' => $ticket['latitude'] !== null ? (float) $ticket['latitude'] : null,
            'longitude' => $ticket['longitude'] !== null ? (float) $ticket['longitude'] : null,
            'preferred_time_slot' => $ticket['preferred_time_slot'] !== null ? (string) $ticket['preferred_time_slot'] : null,
            'scheduled_date' => $this->formatDate($ticket['scheduled_date'] ?? null),
            'created_at' => $this->formatDate($ticket['created_at'] ?? null),
            'user_name' => $ticket['user_name'] ?? null,
            'user_email' => $ticket['user_email'] ?? null,
            'user_phone' => $ticket['user_phone'] ?? null,
            'technician_name' => $ticket['technician_name'] ?? null,
            'technician_email' => $ticket['technician_email'] ?? null,
            'technician_phone' => $ticket['technician_phone'] ?? null,
            'appliance_name' => $ticket['appliance_name'] ?? null,
            'appliance_icon' => $ticket['appliance_icon'] ?? null,
            'problem_type_label' => $ticket['problem_type_label'] ?? null,
        ];
    }

    private function formatDate(mixed $value): ?string
    {
        if ($value === null || $value === '') {
            return null;
        }

        return (new DateTimeImmutable((string) $value))->format(DATE_ATOM);
    }

    private function nullableString(mixed $value): ?string
    {
        if ($value === null) {
            return null;
        }

        $value = trim((string) $value);
        return $value === '' ? null : $value;
    }

    private function nullableInt(mixed $value): ?int
    {
        if ($value === null || $value === '') {
            return null;
        }

        return (int) $value;
    }

    private function nullableFloat(mixed $value): ?float
    {
        if ($value === null || $value === '') {
            return null;
        }

        return (float) $value;
    }

    private function toBool(mixed $value): bool
    {
        if (is_bool($value)) {
            return $value;
        }

        return in_array(strtolower((string) $value), ['1', 'true', 't', 'yes', 'y'], true);
    }

    private function query(string $name): ?string
    {
        return isset($_GET[$name]) ? (string) $_GET[$name] : null;
    }

    private function queryInt(string $name, int $default, int $min, int $max): int
    {
        $value = isset($_GET[$name]) ? (int) $_GET[$name] : $default;
        return max($min, min($max, $value));
    }

    private function jsonBody(): array
    {
        $raw = file_get_contents('php://input');
        if ($raw === false || $raw === '') {
            return [];
        }

        try {
            $data = json_decode($raw, true, 512, JSON_THROW_ON_ERROR);
        } catch (Throwable) {
            throw new ApiException('Invalid JSON payload', 400);
        }

        if (!is_array($data)) {
            throw new ApiException('Invalid JSON payload', 400);
        }

        return $data;
    }

    private function sendCorsHeaders(): void
    {
        $origin = $_SERVER['HTTP_ORIGIN'] ?? null;
        $allowedOrigins = $this->config['cors'];

        if ($origin !== null && in_array($origin, $allowedOrigins, true)) {
            header('Access-Control-Allow-Origin: ' . $origin);
        } elseif ($origin === null && $allowedOrigins !== []) {
            header('Access-Control-Allow-Origin: ' . $allowedOrigins[0]);
        }

        header('Vary: Origin');
        header('Access-Control-Allow-Credentials: true');
        header('Access-Control-Allow-Headers: Content-Type, Authorization');
        header('Access-Control-Allow-Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS');
        header('Content-Type: application/json');
    }

    private function json(array $data, int $statusCode = 200): void
    {
        http_response_code($statusCode);
        echo json_encode($data, JSON_UNESCAPED_SLASHES);
    }

    private function error(string $message, int $statusCode): void
    {
        http_response_code($statusCode);
        echo json_encode(['detail' => $message], JSON_UNESCAPED_SLASHES);
    }
}
