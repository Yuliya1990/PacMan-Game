import pygame
from board import boards
import heapq

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
blinky_x = 35
blinky_y = 33
blinky_direction = 0
blinky_box = False
pinky_x = 430
pinky_y = 150
pinky_direction = 2
pinky_box = False
inky_x = 270
inky_y = 250
inky_direction = 2
inky_box = False
clide_x = 230
clide_y = 250
clide_direction = 2
clide_box = False

player_x = 290
player_y = 410
direction = 0
counter = 0
flicker = False
# R, L, U, D
turns_allowed = [False, False, False, False]
direction_command = 0
player_speed = 2


eaten_ghost = [False, False, False, False]
targets = [(player_x, player_y), (player_x, player_y), (player_x, player_y), (player_x, player_y)]

ghost_speed = 1  # Швидкість руху привидів



class Ghost:
    def __init__(self, x_coord, y_coord, target, speed, color, direct, box, id):
        self.x_pos = x_coord
        self.y_pos = y_coord
        self.center_x = self.x_pos + 11
        self.center_y = self.y_pos + 11
        self.target = target
        self.speed = speed
        self.color = color
        self.direction = direct
        self.in_box = box
        self.id = id
        self.turns = check_position(self.center_x, self.center_y)
        self.circle = self.draw()
        self.last_move_time = 0 
        self.move_delay = 500 

    def draw(self):
        pygame.draw.circle(screen, self.color, (self.center_x, self.center_y), 11)



    def move_pinky(self):
        # Separate timer for Pinky's movement
        current_time = pygame.time.get_ticks()
        if current_time - self.last_move_time < self.move_delay:
            return self.x_pos, self.y_pos, self.direction
        self.last_move_time = current_time

        # Define a heuristic function for A* (Manhattan distance)
        def heuristic(position, target):
            return abs(position[0] - target[0]) + abs(position[1] - target[1])

        # Convert Pinky's and player's positions to grid coordinates
        start = (self.x_pos // 30, self.y_pos // 32)  # Pinky's current position
        target = (player_x // 30, player_y // 32)  # Player's position

        open_list = []  # Priority queue for open nodes
        heapq.heappush(open_list, (0, start))  # Add the start node with priority 0
        came_from = {}  # Dictionary to store the parent of each node

        g_score = {start: 0}  # Dictionary to store the cost from the start to each node
        f_score = {start: heuristic(start, target)}  # Dictionary to store f scores

        while open_list:
            _, current = heapq.heappop(open_list)  # Get the node with the lowest f score

            if current == target:
                # Reconstruct the path
                path = []
                while current in came_from:
                    path.append(current)
                    current = came_from[current]
                path.reverse()

                # Move Pinky along the path
                if len(path) > 1:
                    next_node = path[1]
                    next_x, next_y = next_node[0] * 30, next_node[1] * 32
                    if next_x > self.x_pos:
                        self.direction = 0  # Move right
                    elif next_x < self.x_pos:
                        self.direction = 1  # Move left
                    elif next_y < self.y_pos:
                        self.direction = 2  # Move up
                    elif next_y > self.y_pos:
                        self.direction = 3  # Move down
                    # Slow down Pinky's movement (adjust this value as needed)
                    move_distance = min(self.speed, 1)
                    dx, dy = 0, 0
                    if self.direction == 0:
                        dx = move_distance
                    elif self.direction == 1:
                        dx = -move_distance
                    elif self.direction == 2:
                        dy = -move_distance
                    elif self.direction == 3:
                        dy = move_distance
                    self.x_pos += dx
                    self.y_pos += dy

                    # Check if Pinky is close to the next node (for smoother movement)
                    if (
                        abs(self.x_pos - next_x) <= move_distance
                        and abs(self.y_pos - next_y) <= move_distance
                    ):
                        self.x_pos, self.y_pos = next_x, next_y

                return self.x_pos, self.y_pos, self.direction

            for dx, dy in [(1, 0), (-1, 0), (0, 1), (0, -1)]:
                neighbor = (current[0] + dx, current[1] + dy)
                tentative_g_score = g_score[current] + 1

                if (
                    0 <= neighbor[0] < len(level[0])
                    and 0 <= neighbor[1] < len(level)
                    and level[neighbor[1]][neighbor[0]] < 3  # Check if it's a valid tile
                ):
                    if neighbor not in g_score or tentative_g_score < g_score[neighbor]:
                        came_from[neighbor] = current
                        g_score[neighbor] = tentative_g_score
                        f_score[neighbor] = tentative_g_score + heuristic(neighbor, target)
                        heapq.heappush(open_list, (f_score[neighbor], neighbor))

        # If there is no valid path, return the current position
        return self.x_pos, self.y_pos, self.direction

    def move_clyde(self):
        # Перевіряємо розташування гравця
        player_center_x = player_x + 11
        player_center_y = player_y + 11

        # Отримуємо доступ до можливих напрямків руху
        self.turns = check_position(self.center_x, self.center_y)

        # Якщо гравець перебуває праворуч від "Clyde" і є можливість повороту вправо
        if player_center_x > self.center_x and self.turns[0]:
            self.direction = 0  # Рух вправо
            self.x_pos += self.speed
        # Якщо гравець перебуває ліворуч від "Clyde" і є можливість повороту вліво
        elif player_center_x < self.center_x and self.turns[1]:
            self.direction = 1  # Рух вліво
            self.x_pos -= self.speed
        # Якщо гравець перебуває нижче від "Clyde" і є можливість повороту вниз
        elif player_center_y > self.center_y and self.turns[3]:
            self.direction = 3  # Рух вниз
            self.y_pos += self.speed
        # Якщо гравець перебуває вище від "Clyde" і є можливість повороту вверх
        elif player_center_y < self.center_y and self.turns[2]:
            self.direction = 2  # Рух вверх
            self.y_pos -= self.speed

        # Обробка випадку, коли гравець і "Clyde" вже близько одне до одного,
        # ви можете додати свою логіку тут.

        # Змінюємо координати центра привида
        self.center_x = self.x_pos + 11
        self.center_y = self.y_pos + 11

        # Перевірка на виход за межі екрану
        if self.x_pos < -30:
            self.x_pos = 900
        elif self.x_pos > 900:
            self.x_pos - 30

        return self.x_pos, self.y_pos, self.direction




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
    blinky = Ghost(blinky_x, blinky_y, targets[0], ghost_speed, blinky_color, blinky_direction,
                   blinky_box, 0)
    inky = Ghost(inky_x, inky_y, targets[1], ghost_speed, inky_color, inky_direction,
                 inky_box, 1)
    pinky = Ghost(pinky_x, pinky_y, targets[2], ghost_speed, pinky_color, pinky_direction,
                  pinky_box, 2)
    clyde = Ghost(clide_x, clide_y, targets[3], ghost_speed, clide_color, clide_direction,
                  clide_box, 3)
    
    center_x = player_x+11
    center_y = player_y+11
    turns_allowed = check_position(center_x, center_y)
    player_x, player_y = move_player(player_x, player_y)
    blinky_x, blinky_y, blinky_direction = blinky.move_clyde()
    pinky_x, pinky_y, pinky_direction = pinky.move_pinky()
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