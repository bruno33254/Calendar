-- Sample data for the assessement table
-- Run this after creating the table to populate it with test data

USE calendarapp;

-- Insert sample assessments with colors
INSERT INTO assessement (name, description, submit_date, color) VALUES
('Math Test', 'Algebra and Geometry test covering chapters 5-8', '2025-08-25', '#FF6B6B'),
('English Essay', 'Write a 1000-word essay about your favorite book', '2025-08-26', '#4ECDC4'),
('Science Project', 'Create a volcano model and write a report', '2025-08-27', '#45B7D1'),
('History Assignment', 'Research paper on World War II', '2025-08-28', '#96CEB4'),
('Art Portfolio', 'Submit your best artwork from this semester', '2025-08-29', '#FFEAA7'),
('Physics Lab Report', 'Lab report on Newton\'s Laws of Motion', '2025-09-01', '#DDA0DD'),
('Literature Review', 'Book review of "To Kill a Mockingbird"', '2025-09-02', '#98D8C8'),
('Chemistry Quiz', 'Quiz on chemical bonding and reactions', '2025-09-03', '#F7DC6F'),
('Geography Project', 'Create a map of your local area', '2025-09-04', '#BB8FCE'),
('Music Performance', 'Perform a piece on your chosen instrument', '2025-09-05', '#F1948A');

-- Verify the data was inserted
SELECT * FROM assessement ORDER BY submit_date; 