-- Triggery dla automatycznej aktualizacji licznika odpowiedzi

-- Trigger po dodaniu odpowiedzi
DROP TRIGGER IF EXISTS after_reply_insert;
DELIMITER //
CREATE TRIGGER after_reply_insert
AFTER INSERT ON replies
FOR EACH ROW
BEGIN
    UPDATE posts 
    SET replies_count = replies_count + 1 
    WHERE id = NEW.post_id;
END//
DELIMITER ;

-- Trigger po usunięciu odpowiedzi
DROP TRIGGER IF EXISTS after_reply_delete;
DELIMITER //
CREATE TRIGGER after_reply_delete
AFTER DELETE ON replies
FOR EACH ROW
BEGIN
    UPDATE posts 
    SET replies_count = GREATEST(0, replies_count - 1) 
    WHERE id = OLD.post_id;
END//
DELIMITER ;
