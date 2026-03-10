package com.whiteboard.backend.repository;



import com.whiteboard.backend.entity.DrawEvent;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface DrawEventRepository extends JpaRepository<DrawEvent, UUID> {

    List<DrawEvent> findByBoardIdOrderByVersionAsc(UUID boardId);

    List<DrawEvent> findByBoardIdAndVersionGreaterThanOrderByVersionAsc(UUID boardId, Long version);

    @Query("SELECT COALESCE(MAX(e.version), 0) + 1 FROM DrawEvent e WHERE e.board.id = :boardId")
    Long getNextVersion(@Param("boardId") UUID boardId);
}
