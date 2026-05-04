CREATE TABLE pets (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    breed VARCHAR(100) NOT NULL,
    age INTEGER NOT NULL CHECK (age >= 0),
    price NUMERIC(10, 2) NOT NULL CHECK (price > 0),
    description TEXT NOT NULL,
    image_url VARCHAR(500) NOT NULL,
    available BOOLEAN NOT NULL DEFAULT TRUE,
    category VARCHAR(20) NOT NULL CHECK (category IN ('CATS', 'DOGS', 'FISH', 'BIRDS')),
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_pets_category ON pets (category);
CREATE INDEX idx_pets_category_name ON pets (category, name);
