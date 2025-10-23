-- Dodanie kolumn location i website do tabeli users
-- Data: 2025-10-23

USE platforma_y;

-- Sprawdź czy kolumny już nie istnieją przed dodaniem
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS location VARCHAR(30) NULL AFTER bio,
ADD COLUMN IF NOT EXISTS website VARCHAR(100) NULL AFTER location;

-- Opcjonalnie: Dodaj indeks na location dla szybszego wyszukiwania
-- CREATE INDEX idx_location ON users(location);
