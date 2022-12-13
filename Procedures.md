# GetMissionStationAnalysis report

DELIMITER $$

CREATE PROCEDURE `GetMissionStationAnalysis`(
IN station_id INT,
IN from_month INT,
IN from_year INT,
IN to_month INT,
IN to_year INT
)
BEGIN
SELECT \* FROM todos WHERE completed = done;
END$$

DELIMITER ;
