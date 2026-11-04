import { TileType, InteractiveNode } from './tileMaps';

export type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';

export class SpriteRenderer {
  public static readonly TILE_SIZE = 40;

  // Render a specific tile on canvas
  static renderTile(
    ctx: CanvasRenderingContext2D,
    type: TileType,
    screenX: number,
    screenY: number,
    isDoorUnlocked: boolean = false,
    frameTick: number = 0
  ) {
    const s = this.TILE_SIZE;

    switch (type) {
      case 'WALL': {
        // Office partition / brick wall
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(screenX, screenY, s, s);

        // Brick mortar lines
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(screenX, screenY + s - 3, s, 3);
        ctx.fillRect(screenX, screenY + Math.floor(s / 2), s, 2);
        ctx.fillRect(screenX + Math.floor(s / 2), screenY, 2, Math.floor(s / 2));

        // Top highlight
        ctx.fillStyle = '#334155';
        ctx.fillRect(screenX, screenY, s, 3);
        break;
      }

      case 'FLOOR': {
        // Office tiled floor
        ctx.fillStyle = '#f1f5f9';
        ctx.fillRect(screenX, screenY, s, s);

        // Subtle tile seam
        ctx.strokeStyle = '#e2e8f0';
        ctx.lineWidth = 1;
        ctx.strokeRect(screenX + 0.5, screenY + 0.5, s - 1, s - 1);
        break;
      }

      case 'CARPET': {
        // Royal red/blue runner carpet
        ctx.fillStyle = '#991b1b'; // Crimson carpet
        ctx.fillRect(screenX, screenY, s, s);

        // Gold trim
        ctx.fillStyle = '#d97706';
        ctx.fillRect(screenX, screenY, 3, s);
        ctx.fillRect(screenX + s - 3, screenY, 3, s);

        // Carpet texture specks
        ctx.fillStyle = '#7f1d1d';
        ctx.fillRect(screenX + 8, screenY + 10, 4, 4);
        ctx.fillRect(screenX + 24, screenY + 26, 4, 4);
        break;
      }

      case 'DESK': {
        // Floor under desk
        ctx.fillStyle = '#f1f5f9';
        ctx.fillRect(screenX, screenY, s, s);

        // Wooden desk
        ctx.fillStyle = '#78350f';
        ctx.fillRect(screenX + 2, screenY + 8, s - 4, s - 12);
        ctx.fillStyle = '#92400e';
        ctx.fillRect(screenX + 4, screenY + 10, s - 8, s - 16);

        // Computer monitor CRT
        ctx.fillStyle = '#334155';
        ctx.fillRect(screenX + 12, screenY + 12, 16, 12);
        // Green phosphor screen
        const glow = Math.sin(frameTick * 0.1) > 0 ? '#4ade80' : '#22c55e';
        ctx.fillStyle = glow;
        ctx.fillRect(screenX + 14, screenY + 14, 12, 8);
        break;
      }

      case 'CABINET': {
        // Floor
        ctx.fillStyle = '#f1f5f9';
        ctx.fillRect(screenX, screenY, s, s);

        // Metal filing cabinet
        ctx.fillStyle = '#475569';
        ctx.fillRect(screenX + 4, screenY + 4, s - 8, s - 8);
        ctx.fillStyle = '#64748b';
        ctx.fillRect(screenX + 6, screenY + 6, s - 12, s - 12);

        // Drawers with handles
        ctx.fillStyle = '#334155';
        ctx.fillRect(screenX + 8, screenY + 12, s - 16, 2);
        ctx.fillRect(screenX + 8, screenY + 22, s - 16, 2);
        ctx.fillRect(screenX + 8, screenY + 30, s - 16, 2);

        // Brass handles
        ctx.fillStyle = '#f59e0b';
        ctx.fillRect(screenX + 16, screenY + 10, 8, 2);
        ctx.fillRect(screenX + 16, screenY + 20, 8, 2);
        ctx.fillRect(screenX + 16, screenY + 28, 8, 2);
        break;
      }

      case 'DOOR_LOCKED': {
        if (isDoorUnlocked) {
          // Render as open door
          this.renderTile(ctx, 'DOOR_OPEN', screenX, screenY, true, frameTick);
          return;
        }
        // Heavy locked gate
        ctx.fillStyle = '#1e1b4b';
        ctx.fillRect(screenX, screenY, s, s);

        // Metal bars
        ctx.fillStyle = '#64748b';
        ctx.fillRect(screenX + 4, screenY, 4, s);
        ctx.fillRect(screenX + 14, screenY, 4, s);
        ctx.fillRect(screenX + 24, screenY, 4, s);
        ctx.fillRect(screenX + 32, screenY, 4, s);

        // Glowing red padlock
        const pulse = Math.sin(frameTick * 0.15) > 0 ? '#ef4444' : '#b91c1c';
        ctx.fillStyle = pulse;
        ctx.fillRect(screenX + 14, screenY + 14, 12, 12);
        ctx.fillStyle = '#fecaca';
        ctx.fillRect(screenX + 18, screenY + 18, 4, 4);
        break;
      }

      case 'DOOR_OPEN': {
        // Open passage with green scanner light
        ctx.fillStyle = '#f1f5f9';
        ctx.fillRect(screenX, screenY, s, s);

        ctx.fillStyle = '#22c55e';
        ctx.fillRect(screenX, screenY, 4, s);
        ctx.fillRect(screenX + s - 4, screenY, 4, s);

        // Floor arrow pointing forward
        ctx.fillStyle = '#86efac';
        ctx.fillRect(screenX + 16, screenY + 16, 8, 8);
        break;
      }

      case 'ELEVATOR': {
        // Elevator cabin doors
        ctx.fillStyle = '#334155';
        ctx.fillRect(screenX, screenY, s, s);

        // Brass finish
        ctx.fillStyle = '#d97706';
        ctx.fillRect(screenX + 3, screenY + 3, s - 6, s - 6);

        // Door slit
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(screenX + Math.floor(s / 2) - 1, screenY + 3, 2, s - 6);

        // Up arrow indicator
        ctx.fillStyle = '#22c55e';
        ctx.beginPath();
        ctx.moveTo(screenX + Math.floor(s / 2), screenY + 8);
        ctx.lineTo(screenX + Math.floor(s / 2) - 6, screenY + 16);
        ctx.lineTo(screenX + Math.floor(s / 2) + 6, screenY + 16);
        ctx.fill();
        break;
      }

      case 'PLANT': {
        // Floor
        ctx.fillStyle = '#f1f5f9';
        ctx.fillRect(screenX, screenY, s, s);

        // Pot
        ctx.fillStyle = '#b45309';
        ctx.fillRect(screenX + 12, screenY + 22, 16, 14);

        // Green leafy foliage
        ctx.fillStyle = '#15803d';
        ctx.beginPath();
        ctx.arc(screenX + 20, screenY + 14, 12, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#22c55e';
        ctx.beginPath();
        ctx.arc(screenX + 18, screenY + 12, 8, 0, Math.PI * 2);
        ctx.fill();
        break;
      }

      default: {
        ctx.fillStyle = '#f8fafc';
        ctx.fillRect(screenX, screenY, s, s);
      }
    }
  }

  // Render the player character in pixel art style
  static renderPlayer(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    direction: Direction,
    isMoving: boolean,
    walkFrame: number
  ) {
    const s = this.TILE_SIZE;
    const px = Math.floor(x);
    const py = Math.floor(y);

    // Shadow under player
    ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
    ctx.beginPath();
    ctx.ellipse(px + s / 2, py + s - 4, 12, 5, 0, 0, Math.PI * 2);
    ctx.fill();

    const legOffset = isMoving ? Math.sin(walkFrame * 0.4) * 4 : 0;

    // Body: Dark Navy Suit (Fiscal de Auditoria)
    ctx.fillStyle = '#1e3a8a';
    ctx.fillRect(px + 12, py + 14, 16, 16);

    // Legs / Pants
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(px + 13 - legOffset, py + 28, 6, 8);
    ctx.fillRect(px + 21 + legOffset, py + 28, 6, 8);

    // Shoes
    ctx.fillStyle = '#000000';
    ctx.fillRect(px + 12 - legOffset, py + 34, 7, 4);
    ctx.fillRect(px + 21 + legOffset, py + 34, 7, 4);

    // White shirt collar & Red tie (Audit tie!)
    if (direction === 'DOWN') {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(px + 18, py + 14, 4, 6);
      ctx.fillStyle = '#dc2626'; // Red tie
      ctx.fillRect(px + 19, py + 16, 2, 7);
    }

    // Head / Skin
    ctx.fillStyle = '#fed7aa';
    ctx.fillRect(px + 12, py + 4, 16, 12);

    // Hair (Professional haircut)
    ctx.fillStyle = '#451a03';
    ctx.fillRect(px + 11, py + 2, 18, 5);
    if (direction === 'LEFT') {
      ctx.fillRect(px + 10, py + 4, 4, 7);
    } else if (direction === 'RIGHT') {
      ctx.fillRect(px + 26, py + 4, 4, 7);
    }

    // Dark Sunglasses (Óculos escuro de agente regulador)
    if (direction === 'DOWN') {
      ctx.fillStyle = '#0f172a'; // Black frame & lenses
      ctx.fillRect(px + 13, py + 8, 14, 4);
      // Shine line
      ctx.fillStyle = '#94a3b8';
      ctx.fillRect(px + 14, py + 8, 3, 1);
      ctx.fillRect(px + 21, py + 8, 3, 1);
      // Gold hinge pins
      ctx.fillStyle = '#d97706';
      ctx.fillRect(px + 12, py + 9, 1, 2);
      ctx.fillRect(px + 27, py + 9, 1, 2);
    } else if (direction === 'LEFT') {
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(px + 11, py + 8, 6, 4);
      ctx.fillStyle = '#94a3b8';
      ctx.fillRect(px + 12, py + 8, 2, 1);
      ctx.fillStyle = '#d97706';
      ctx.fillRect(px + 17, py + 9, 4, 1);
    } else if (direction === 'RIGHT') {
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(px + 23, py + 8, 6, 4);
      ctx.fillStyle = '#94a3b8';
      ctx.fillRect(px + 26, py + 8, 2, 1);
      ctx.fillStyle = '#d97706';
      ctx.fillRect(px + 19, py + 9, 4, 1);
    }

    // Official Briefcase ("Pasta de Fiscal")
    ctx.fillStyle = '#78350f';
    if (direction === 'DOWN' || direction === 'RIGHT') {
      ctx.fillRect(px + 26, py + 20, 8, 7);
      ctx.fillStyle = '#f59e0b';
      ctx.fillRect(px + 28, py + 19, 4, 2); // handle
    } else if (direction === 'LEFT') {
      ctx.fillRect(px + 6, py + 20, 8, 7);
      ctx.fillStyle = '#f59e0b';
      ctx.fillRect(px + 8, py + 19, 4, 2); // handle
    }
  }

  // Render NPC sprite
  static renderNPC(
    ctx: CanvasRenderingContext2D,
    npc: InteractiveNode,
    screenX: number,
    screenY: number,
    frameTick: number
  ) {
    const s = this.TILE_SIZE;
    const px = screenX;
    const py = screenY;

    // Shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
    ctx.beginPath();
    ctx.ellipse(px + s / 2, py + s - 4, 12, 5, 0, 0, Math.PI * 2);
    ctx.fill();

    let suitColor = '#047857'; // Green inspector
    let hairColor = '#713f12';
    if (npc.avatar === 'crepaldi') {
      suitColor = '#1e3a8a'; // Distinguished navy professor suit
      hairColor = '#94a3b8'; // Distinguished silver hair
    } else if (npc.avatar === 'analyst') {
      suitColor = '#0f766e'; // Teal analyst suit
      hairColor = '#b45309';
    } else if (npc.avatar === 'staff') {
      suitColor = '#7c3aed'; // Purple staff
      hairColor = '#f59e0b';
    } else if (npc.avatar === 'cfo') {
      suitColor = '#b91c1c'; // Red executive
      hairColor = '#94a3b8';
    } else if (npc.avatar === 'auditor') {
      suitColor = '#0284c7';
      hairColor = '#1e293b';
    }

    // Body
    ctx.fillStyle = suitColor;
    ctx.fillRect(px + 12, py + 14, 16, 16);

    // Legs
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(px + 14, py + 28, 5, 8);
    ctx.fillRect(px + 21, py + 28, 5, 8);

    // Head
    ctx.fillStyle = '#fed7aa';
    ctx.fillRect(px + 12, py + 4, 16, 12);

    // Hair
    ctx.fillStyle = hairColor;
    ctx.fillRect(px + 11, py + 2, 18, 5);
    ctx.fillRect(px + 10, py + 5, 3, 5);
    ctx.fillRect(px + 27, py + 5, 3, 5);

    // Eyes
    ctx.fillStyle = '#000000';
    ctx.fillRect(px + 15, py + 8, 2, 2);
    ctx.fillRect(px + 23, py + 8, 2, 2);

    // Exclamation point bubble floating over NPC
    const floatY = Math.sin(frameTick * 0.1) * 3;
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(px + s / 2, py - 4 + floatY, 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.fillStyle = '#dc2626';
    ctx.font = 'bold 10px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('!', px + s / 2, py + floatY);
  }

  // Render question interactive marker (sparkle/halo)
  static renderQuestionMarker(
    ctx: CanvasRenderingContext2D,
    node: InteractiveNode,
    screenX: number,
    screenY: number,
    isSolved: boolean,
    frameTick: number
  ) {
    const s = this.TILE_SIZE;
    if (isSolved) {
      // Small green checkmark
      ctx.fillStyle = '#22c55e';
      ctx.font = 'bold 14px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('✓', screenX + s / 2, screenY + 12);
      return;
    }

    // Glowing question diamond / star
    const floatY = Math.sin(frameTick * 0.12) * 4;
    const pulse = Math.abs(Math.sin(frameTick * 0.08)) * 0.4 + 0.6;

    ctx.fillStyle = `rgba(245, 158, 11, ${pulse})`;
    ctx.beginPath();
    ctx.arc(screenX + s / 2, screenY - 4 + floatY, 9, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = '#78350f';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 11px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('?', screenX + s / 2, screenY + floatY);
  }

  // Render Easter Egg / Hint marker (bulb/curiosity icon)
  static renderHintMarker(
    ctx: CanvasRenderingContext2D,
    screenX: number,
    screenY: number,
    frameTick: number
  ) {
    const s = this.TILE_SIZE;
    const floatY = Math.sin(frameTick * 0.1) * 3;
    const pulse = Math.abs(Math.sin(frameTick * 0.08)) * 0.3 + 0.7;

    ctx.fillStyle = `rgba(14, 165, 233, ${pulse})`;
    ctx.beginPath();
    ctx.arc(screenX + s / 2, screenY - 3 + floatY, 8, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = '#0369a1';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 9px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('💡', screenX + s / 2, screenY + 1 + floatY);
  }
}
