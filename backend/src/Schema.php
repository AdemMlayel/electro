<?php

declare(strict_types=1);

namespace App;

use PDO;

final class Schema
{
    private static bool $initialized = false;

    public static function ensure(PDO $pdo): void
    {
        if (self::$initialized) {
            return;
        }

        $pdo->exec('CREATE EXTENSION IF NOT EXISTS pgcrypto');

        $pdo->exec(<<<'SQL'
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    phone VARCHAR(30),
    password_hash TEXT NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'user',
    address TEXT,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS appliances (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    icon VARCHAR(100),
    image_url VARCHAR(255),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS problem_types (
    id SERIAL PRIMARY KEY,
    appliance_id INTEGER REFERENCES appliances(id) ON DELETE CASCADE,
    label VARCHAR(100) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (appliance_id, label)
);

CREATE TABLE IF NOT EXISTS tickets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    technician_id UUID REFERENCES users(id) ON DELETE SET NULL,
    appliance_id INTEGER NOT NULL REFERENCES appliances(id) ON DELETE RESTRICT,
    problem_type_id INTEGER REFERENCES problem_types(id) ON DELETE SET NULL,
    brand VARCHAR(100),
    model VARCHAR(100),
    description TEXT NOT NULL,
    urgency VARCHAR(10),
    status VARCHAR(30) NOT NULL DEFAULT 'pending',
    phone VARCHAR(30),
    address TEXT NOT NULL,
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    preferred_time_slot VARCHAR(100),
    scheduled_date TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS ticket_status_history (
    id SERIAL PRIMARY KEY,
    ticket_id UUID NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
    old_status VARCHAR(30),
    new_status VARCHAR(30) NOT NULL,
    changed_by UUID REFERENCES users(id) ON DELETE SET NULL,
    changed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS ticket_media (
    id SERIAL PRIMARY KEY,
    ticket_id UUID REFERENCES tickets(id) ON DELETE CASCADE,
    media_url VARCHAR(255) NOT NULL,
    media_type VARCHAR(10),
    uploaded_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(30) NOT NULL DEFAULT 'system',
    title VARCHAR(160) NOT NULL,
    body TEXT NOT NULL,
    link VARCHAR(255),
    entity_type VARCHAR(50),
    entity_id VARCHAR(64),
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ticket_id UUID NOT NULL UNIQUE REFERENCES tickets(id) ON DELETE CASCADE,
    client_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    technician_id UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS conversation_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    body TEXT NOT NULL,
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS refresh_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token TEXT NOT NULL UNIQUE,
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS password_reset_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token TEXT NOT NULL UNIQUE,
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
SQL);

        $pdo->exec('ALTER TABLE appliances ADD COLUMN IF NOT EXISTS image_url VARCHAR(255)');

        $pdo->exec('CREATE INDEX IF NOT EXISTS idx_tickets_user_id ON tickets(user_id)');
        $pdo->exec('CREATE INDEX IF NOT EXISTS idx_tickets_technician_id ON tickets(technician_id)');
        $pdo->exec('CREATE INDEX IF NOT EXISTS idx_tickets_status ON tickets(status)');
        $pdo->exec('CREATE INDEX IF NOT EXISTS idx_notifications_user_read ON notifications(user_id, is_read, created_at DESC)');
        $pdo->exec('CREATE INDEX IF NOT EXISTS idx_notifications_entity ON notifications(entity_type, entity_id)');
        $pdo->exec('CREATE INDEX IF NOT EXISTS idx_conversations_client ON conversations(client_id, updated_at DESC)');
        $pdo->exec('CREATE INDEX IF NOT EXISTS idx_conversations_technician ON conversations(technician_id, updated_at DESC)');
        $pdo->exec('CREATE INDEX IF NOT EXISTS idx_conversation_messages_conversation ON conversation_messages(conversation_id, created_at ASC)');
        $pdo->exec('CREATE INDEX IF NOT EXISTS idx_conversation_messages_sender_read ON conversation_messages(conversation_id, sender_id, is_read)');

        self::seedUsers($pdo);
        self::seedAppliances($pdo);
        self::seedProblemTypes($pdo);

        self::$initialized = true;
    }

    private static function seedUsers(PDO $pdo): void
    {
        $users = [
            [
                'full_name' => 'Admin Admin',
                'email' => 'adminadmin@test.com',
                'password' => 'adminadmin',
                'role' => 'admin',
            ],
            [
                'full_name' => 'Test Technician',
                'email' => 'testtechnician@test.com',
                'password' => 'testtechnician',
                'role' => 'technician',
            ],
        ];

        $stmt = $pdo->prepare(<<<'SQL'
INSERT INTO users (full_name, email, password_hash, role, is_active)
VALUES (:full_name, :email, :password_hash, :role, TRUE)
ON CONFLICT (email) DO UPDATE SET role = EXCLUDED.role
SQL);

        foreach ($users as $user) {
            $stmt->execute([
                ':full_name' => $user['full_name'],
                ':email' => $user['email'],
                ':password_hash' => password_hash($user['password'], PASSWORD_BCRYPT),
                ':role' => $user['role'],
            ]);
        }
    }

    private static function seedAppliances(PDO $pdo): void
    {
        $appliances = [
            ['name' => 'Refrigerator', 'icon' => 'refrigerator'],
            ['name' => 'Washing Machine', 'icon' => 'washing_machine'],
            ['name' => 'Microwave', 'icon' => 'microwave'],
            ['name' => 'Oven', 'icon' => 'oven'],
            ['name' => 'Dishwasher', 'icon' => 'dishwasher'],
            ['name' => 'Air Conditioner', 'icon' => 'ac'],
            ['name' => 'TV', 'icon' => 'tv'],
            ['name' => 'Vacuum Cleaner', 'icon' => 'vacuum'],
            ['name' => 'Water Heater', 'icon' => 'water_heater'],
            ['name' => 'Coffee Machine', 'icon' => 'coffee'],
        ];

        $stmt = $pdo->prepare('INSERT INTO appliances (name, icon) VALUES (:name, :icon) ON CONFLICT (name) DO NOTHING');
        foreach ($appliances as $appliance) {
            $stmt->execute([
                ':name' => $appliance['name'],
                ':icon' => $appliance['icon'],
            ]);
        }
    }

    private static function seedProblemTypes(PDO $pdo): void
    {
        $problemTypes = [
            'Refrigerator' => ['Not cooling', 'Water leakage', 'Excessive noise'],
            'Washing Machine' => ['Not spinning', 'Water not draining', 'Door stuck'],
            'Microwave' => ['Not heating', 'Sparking', 'Turntable issue'],
            'Oven' => ['Not heating', 'Temperature issue', 'Door issue'],
            'Dishwasher' => ['Not cleaning', 'Water leakage', 'Drain issue'],
            'Air Conditioner' => ['Not cooling', 'Water leakage', 'Strange noise'],
            'TV' => ['No display', 'Sound issue', 'Power issue'],
            'Vacuum Cleaner' => ['No suction', 'Motor issue', 'Battery issue'],
            'Water Heater' => ['No hot water', 'Leakage', 'Pilot issue'],
            'Coffee Machine' => ['No brewing', 'Leakage', 'Power issue'],
        ];

        $stmt = $pdo->prepare(<<<'SQL'
INSERT INTO problem_types (appliance_id, label)
SELECT id, :label
FROM appliances
WHERE name = :appliance_name
ON CONFLICT (appliance_id, label) DO NOTHING
SQL);

        foreach ($problemTypes as $applianceName => $labels) {
            foreach ($labels as $label) {
                $stmt->execute([
                    ':appliance_name' => $applianceName,
                    ':label' => $label,
                ]);
            }
        }
    }
}
