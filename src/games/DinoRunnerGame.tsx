import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { useHaptics } from '../hooks/useHaptics';

const { width } = Dimensions.get('window');

const GROUND_Y = 260;
const DINO_SIZE = 56;
const OBSTACLE_SIZE = 48;
const JUMP_HEIGHT = 130;
const JUMP_DURATION = 600;
const GAME_DURATION = 30;
const OBSTACLE_SPEED = 5;
const SPAWN_INTERVAL = 1600;

interface Obstacle {
  id: number;
  x: number;
}

interface DinoRunnerGameProps {
  onWin: () => void;
  onQuit: () => void;
}

export function DinoRunnerGame({ onWin, onQuit }: DinoRunnerGameProps) {
  const [dinoY, setDinoY] = useState(GROUND_Y);
  const [isJumping, setIsJumping] = useState(false);
  const [obstacles, setObstacles] = useState<Obstacle[]>([]);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION);
  const [gameOver, setGameOver] = useState(false);
  const [crashed, setCrashed] = useState(false);
  const obstacleIdRef = useRef(0);
  const gameLoopRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const jumpRef = useRef(false);
  const { tap, success, error } = useHaptics();

  const dinoYRef = useRef(GROUND_Y);
  const obstaclesRef = useRef<Obstacle[]>([]);
  const gameOverRef = useRef(false);

  // Timer
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          clearInterval(timer);
          if (!gameOverRef.current) {
            gameOverRef.current = true;
            setGameOver(true);
          }
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Obstacle spawner
  useEffect(() => {
    const spawner = setInterval(() => {
      if (gameOverRef.current) return;
      const id = obstacleIdRef.current++;
      setObstacles(prev => {
        const updated = [...prev, { id, x: width }];
        obstaclesRef.current = updated;
        return updated;
      });
    }, SPAWN_INTERVAL);
    return () => clearInterval(spawner);
  }, []);

  // Game loop
  useEffect(() => {
    gameLoopRef.current = setInterval(() => {
      if (gameOverRef.current) return;

      setObstacles(prev => {
        const moved = prev.map(o => ({ ...o, x: o.x - OBSTACLE_SPEED })).filter(o => o.x > -80);
        obstaclesRef.current = moved;

        // Collision detection
        const dinoLeft = 60;
        const dinoRight = dinoLeft + DINO_SIZE - 12;
        const dinoTop = dinoYRef.current - DINO_SIZE;
        const dinoBottom = dinoYRef.current;

        for (const obs of moved) {
          const obsLeft = obs.x + 8;
          const obsRight = obs.x + OBSTACLE_SIZE - 8;
          const obsTop = GROUND_Y - OBSTACLE_SIZE;
          const obsBottom = GROUND_Y;

          if (dinoRight > obsLeft && dinoLeft < obsRight && dinoBottom > obsTop && dinoTop < obsBottom) {
            if (!gameOverRef.current) {
              gameOverRef.current = true;
              setCrashed(true);
              setGameOver(true);
            }
          }
        }

        // Score: obstacle passed
        const passed = prev.filter(o => o.x + OBSTACLE_SIZE < 60).length;
        const nowPassed = moved.filter(o => o.x + OBSTACLE_SIZE < 60).length;
        if (nowPassed > passed) setScore(s => s + 1);

        return moved;
      });
    }, 16);
    return () => { if (gameLoopRef.current) clearInterval(gameLoopRef.current); };
  }, []);

  // Win/lose
  useEffect(() => {
    if (gameOver && !crashed) {
      success();
      onWin();
    }
    if (crashed) error();
  }, [gameOver, crashed]);

  const jump = useCallback(() => {
    if (jumpRef.current || gameOverRef.current) return;
    tap();
    jumpRef.current = true;
    setIsJumping(true);

    const startTime = Date.now();
    const jumpInterval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const progress = elapsed / JUMP_DURATION;
      const jumpY = Math.sin(progress * Math.PI) * JUMP_HEIGHT;
      const newY = GROUND_Y - jumpY;
      dinoYRef.current = newY;
      setDinoY(newY);

      if (elapsed >= JUMP_DURATION) {
        clearInterval(jumpInterval);
        dinoYRef.current = GROUND_Y;
        setDinoY(GROUND_Y);
        setIsJumping(false);
        jumpRef.current = false;
      }
    }, 16);
  }, []);

  const handleRetry = () => {
    gameOverRef.current = false;
    jumpRef.current = false;
    setObstacles([]);
    obstaclesRef.current = [];
    setScore(0);
    setTimeLeft(GAME_DURATION);
    setGameOver(false);
    setCrashed(false);
    setDinoY(GROUND_Y);
    dinoYRef.current = GROUND_Y;
  };

  return (
    <TouchableOpacity style={styles.container} onPress={jump} activeOpacity={1}>
      {/* HUD */}
      <View style={styles.hud}>
        <Text style={styles.score}>🦖 {score} esquivés</Text>
        <Text style={styles.timer}>⏱️ {timeLeft}s</Text>
      </View>

      <Text style={styles.hint}>Tape pour sauter !</Text>

      {/* Ground */}
      <View style={styles.ground} />

      {/* Dino */}
      <Text style={[styles.dino, { top: dinoY - DINO_SIZE, left: 60 }]}>
        {crashed ? '💥' : isJumping ? '🦖' : '🦕'}
      </Text>

      {/* Obstacles */}
      {obstacles.map(obs => (
        <Text key={obs.id} style={[styles.obstacle, { left: obs.x, top: GROUND_Y - OBSTACLE_SIZE }]}>
          🦴
        </Text>
      ))}

      {/* Game Over */}
      {gameOver && (
        <View style={styles.overlay}>
          <Text style={styles.overlayEmoji}>{crashed ? '💥' : '🏆'}</Text>
          <Text style={styles.overlayTitle}>{crashed ? 'Aïe ! Crash !' : 'Survécu !'}</Text>
          <Text style={styles.overlayScore}>
            {crashed ? `Tu as esquivé ${score} obstacles !` : `Bravo ! ${score} obstacles esquivés !`}
          </Text>
          {crashed && (
            <TouchableOpacity style={styles.retryBtn} onPress={handleRetry}>
              <Text style={styles.retryText}>Rejouer</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity style={styles.quitBtn} onPress={onQuit}>
            <Text style={styles.quitText}>Retour</Text>
          </TouchableOpacity>
        </View>
      )}

      {!gameOver && (
        <TouchableOpacity style={styles.quitBtnFixed} onPress={onQuit}>
          <Text style={styles.quitText}>Quitter</Text>
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#e0f2fe', overflow: 'hidden' },
  hud: { flexDirection: 'row', justifyContent: 'space-between', padding: 20, paddingBottom: 8 },
  score: { fontSize: 20, fontWeight: 'bold', color: '#1a1a2e' },
  timer: { fontSize: 20, fontWeight: 'bold', color: '#ef4444' },
  hint: { textAlign: 'center', color: '#64748b', fontSize: 13, marginBottom: 4 },
  ground: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 60, backgroundColor: '#a3e635', borderTopWidth: 3, borderTopColor: '#65a30d', top: GROUND_Y },
  dino: { position: 'absolute', fontSize: DINO_SIZE, lineHeight: DINO_SIZE },
  obstacle: { position: 'absolute', fontSize: OBSTACLE_SIZE, lineHeight: OBSTACLE_SIZE },
  overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(255,255,255,0.95)', alignItems: 'center', justifyContent: 'center' },
  overlayEmoji: { fontSize: 72, marginBottom: 12 },
  overlayTitle: { fontSize: 28, fontWeight: 'bold', color: '#1a1a2e', marginBottom: 8 },
  overlayScore: { fontSize: 16, color: '#555', marginBottom: 24 },
  retryBtn: { backgroundColor: '#0ea5e9', paddingVertical: 12, paddingHorizontal: 32, borderRadius: 16, marginBottom: 12 },
  retryText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  quitBtn: { paddingVertical: 10, paddingHorizontal: 24 },
  quitBtnFixed: { position: 'absolute', bottom: 30, alignSelf: 'center' },
  quitText: { color: '#888', fontSize: 14 },
});
