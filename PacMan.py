import pygame
from board import boards
pygame.init()
import math

WIDTH=550
HEIGHT=600
screen = pygame.display.set_mode([WIDTH, HEIGHT])
timer = timer = pygame.time.Clock()
fps=60
font = pygame.font.Font('freesansbold.ttf', 20)
level = boards
color = 'red'
PI = math.pi
player_images = []
for i in range(1, 5):
    player_images.append(pygame.transform.scale(pygame.image.load(f'assets/player_images/{i}.png'), (22, 22)))

#ghosts
blinky_color = 'red'
pinky_color = 'pink'
inky_color = 'blue'
clide_color = 'orange'

#ghosts_coordinates
blinky_x = 250
blinky_y = 250
pinky_x = 300
pinky_y = 270
inky_x = 270
inky_y = 250
clide_x = 300
clide_y = 300

player_x = 290
player_y = 410
direction = 0
counter = 0
flicker = False
# R, L, U, D
turns_allowed = [False, False, False, False]
direction_command = 0
player_speed = 2

# Coordinates and speed of the ghosts
ghost_coords = [(250, 250), (300, 270)]  # Початкові координати привидів
ghost_speed = 1  # Швидкість руху привидів


def draw_board():
    num1 = ((HEIGHT - 50) // 32)
    num2 = (WIDTH // 30)
    for i in range(len(level)):
        for j in range(len(level[i])):
            if level[i][j] == 1:
                pygame.draw.circle(screen, 'white', (j * num2 + (0.5 * num2), i * num1 + (0.5 * num1)), 2)
            if level[i][j] == 2 and not flicker:
                pygame.draw.circle(screen, 'white', (j * num2 + (0.5 * num2), i * num1 + (0.5 * num1)), 7)
            if level[i][j] == 3:
                pygame.draw.line(screen, color, (j * num2 + (0.5 * num2), i * num1),
                                 (j * num2 + (0.5 * num2), i * num1 + num1), 1)
            if level[i][j] == 4:
                pygame.draw.line(screen, color, (j * num2, i * num1 + (0.5 * num1)),
                                 (j * num2 + num2, i * num1 + (0.5 * num1)), 1)
            if level[i][j] == 5:
                pygame.draw.arc(screen, color, [(j * num2 - (num2 * 0.4))-1, (i * num1 + (0.5 * num1)), num2, num1],
                                0, PI / 2, 1)
            if level[i][j] == 6:
                pygame.draw.arc(screen, color,
                                [(j * num2 + (num2 * 0.5)), (i * num1 + (0.5 * num1))+0.3, num2, num1], PI / 2, PI, 1)
            if level[i][j] == 7:
                pygame.draw.arc(screen, color, [(j * num2 + (num2 * 0.5)), (i * num1 - (0.4 * num1)), num2, num1], PI,
                                3 * PI / 2, 1)
            if level[i][j] == 8:
                pygame.draw.arc(screen, color,
                                [(j * num2 - (num2 * 0.4)) - 1, (i * num1 - (0.4 * num1)), num2, num1], 3 * PI / 2,
                                2 * PI, 1)
            if level[i][j] == 9:
                pygame.draw.line(screen, 'white', (j * num2, i * num1 + (0.5 * num1)),
                                 (j * num2 + num2, i * num1 + (0.5 * num1)), 3)
            

def draw_player():

    # 0-RIGHT, 1-LEFT, 2-UP, 3-DOWN
    if direction == 0:
        screen.blit(player_images[counter // 5], (player_x, player_y))
    elif direction == 1:
        screen.blit(pygame.transform.flip(player_images[counter // 5], True, False), (player_x, player_y))
    elif direction == 2:
        screen.blit(pygame.transform.rotate(player_images[counter // 5], 90), (player_x, player_y))
    elif direction == 3:
        screen.blit(pygame.transform.rotate(player_images[counter // 5], 270), (player_x, player_y))


def draw_ghosts(ghosts):
    ghost_color = 'blue'  # Колір привидів
    for ghost_x, ghost_y in ghosts:
        pygame.draw.circle(screen, ghost_color, (ghost_x, ghost_y), 11)

# Викликайте функцію draw_ghosts для відображення привидів
draw_ghosts(ghost_coords)


#if we allowed to turn or no
def check_position(centerx, centery):
    turns = [False, False, False, False]
    num1 = (HEIGHT - 50) // 32
    num2 = (WIDTH // 30)
    num3 = 7
    # check collisions based on center x and center y of player +/- fudge number
    if centerx // 30 < 17:
        if direction == 0:
            if level[centery // num1][(centerx - num3) // num2] < 3:
                turns[1] = True
        if direction == 1:
            if level[centery // num1][(centerx + num3) // num2] < 3:
                turns[0] = True
        if direction == 2:
            if level[(centery + num3) // num1][centerx // num2] < 3:
                turns[3] = True
        if direction == 3:
            if level[(centery - num3) // num1][centerx // num2] < 3:
                turns[2] = True

        if direction == 2 or direction == 3:
            if 5 <= centerx % num2 <= 18:
                if level[(centery + num3) // num1][centerx // num2] < 3:
                    turns[3] = True
                if level[(centery - num3) // num1][centerx // num2] < 3:
                    turns[2] = True
            if 5 <= centery % num1 <= 18:
                if level[centery // num1][(centerx - num2) // num2] < 3:
                    turns[1] = True
                if level[centery // num1][(centerx + num2) // num2] < 3:
                    turns[0] = True
        if direction == 0 or direction == 1:
            if 5 <= centerx % num2 <= 18:
                if level[(centery + num1) // num1][centerx // num2] < 3:
                    turns[3] = True
                if level[(centery - num1) // num1][centerx // num2] < 3:
                    turns[2] = True
            if 5 <= centery % num1 <= 18:
                if level[centery // num1][(centerx - num3) // num2] < 3:
                    turns[1] = True
                if level[centery // num1][(centerx + num3) // num2] < 3:
                    turns[0] = True
    else:
        turns[0] = True
        turns[1] = True

    return turns


def move_player(play_x, play_y):
    # r, l, u, d
    if direction == 0 and turns_allowed[0]:
        play_x += player_speed
    elif direction == 1 and turns_allowed[1]:
        play_x -= player_speed
    if direction == 2 and turns_allowed[2]:
        play_y -= player_speed
    elif direction == 3 and turns_allowed[3]:
        play_y += player_speed
    return play_x, play_y

def move_ghosts(ghosts, player_x, player_y):
    new_ghosts = []
    for ghost_x, ghost_y in ghosts:
        # Визначаємо напрямок руху для привида
        if ghost_x < player_x:
            ghost_x += ghost_speed
        elif ghost_x > player_x:
            ghost_x -= ghost_speed
        if ghost_y < player_y:
            ghost_y += ghost_speed
        elif ghost_y > player_y:
            ghost_y -= ghost_speed
        new_ghosts.append((ghost_x, ghost_y))
    return new_ghosts


run = True
while run:
    timer.tick(fps)
    if counter < 19:
        counter += 1
        if counter > 3:
            flicker = False
    else:
        counter = 0
        flicker = True
    screen.fill('black')
    draw_board()
    draw_player()
    draw_ghosts(ghost_coords)
    center_x = player_x+11
    center_y = player_y+11
    turns_allowed = check_position(center_x, center_y)
    player_x, player_y = move_player(player_x, player_y)
    ghost_coords = move_ghosts(ghost_coords, player_x, player_y)
    for event in pygame.event.get():
        if event.type==pygame.QUIT:
            run=False
        if event.type == pygame.KEYDOWN:
            if event.key == pygame.K_RIGHT:
                direction_command = 0
            if event.key == pygame.K_LEFT:
                direction_command = 1
            if event.key == pygame.K_UP:
                direction_command = 2
            if event.key == pygame.K_DOWN:
                direction_command = 3
        if event.type == pygame.KEYUP:
            if event.key == pygame.K_RIGHT and direction_command == 0:
                direction_command = direction
            if event.key == pygame.K_LEFT and direction_command == 1:
                direction_command = direction
            if event.key == pygame.K_UP and direction_command == 2:
                direction_command = direction
            if event.key == pygame.K_DOWN and direction_command == 3:
                direction_command = direction
        
        for i in range (4):
            if direction_command == i and turns_allowed[i]:
                direction = i
        
        if player_x > 550:
            player_x = -23
        elif player_x < -30:
            player_x = 547


    pygame.display.flip()

pygame.quit()