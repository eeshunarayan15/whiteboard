package com.whiteboard.backend.repository;


import com.whiteboard.backend.entity.Board;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface BoardRepository extends JpaRepository<Board, UUID> {

    Optional<Board> findByShareCode(String shareCode);
}