import random
import math
import json

def generate_control_points_curtains(width, height, orderU, spirals, wave):
    controlPoints = []
    for i in range(orderU + 1):
        points = []
        rand1 = random.random() * wave - wave
        rand2 = random.random() * wave - wave
        angle = math.pi / 2 * (i / orderU) * spirals
        x = width * (i / orderU)
        z = wave * math.cos(angle)
        y = height
        points.append({"x": x, "y": y, "z": 0})
        points.append({"x": x, "y": y / 4, "z": z + rand2 * z})
        points.append({"x": x, "y": 3 * y / 4, "z": z + rand1 * z})
        points.append({"x": x, "y": 0, "z": z})
        controlPoints.extend(points)
    return controlPoints

def make_curtains():
    width = 30
    height = 38
    orderU = 4
    spirals = 5
    wave = 0.4
    controlPoints = generate_control_points_curtains(width, height, orderU, spirals, wave)

    with open('control_points.txt', 'w') as file:
        json.dump(controlPoints, file, indent=4)

def generate_cp_chair(width, height, orderU):
    controlPoints = []
    for i in range(orderU + 1):
        points = []

        angle = -math.pi * (i / orderU)
        x = width * (i / orderU)
        z = width * math.sin(angle)

        points.append({"x": x, "y": height, "z": 0})
        points.append({"x": x, "y": 2*height/3, "z": z*0.1})
        points.append({"x": x, "y": height/3, "z": z*0.2})
        points.append({"x": x, "y": 0, "z": z*0.3})
        
        controlPoints.extend(points)
    return controlPoints

def make_chair():
    width = 4.9
    height = 2.5
    orderU = 5
    controlPoints = generate_cp_chair(width, height, orderU)

    with open('control_points.txt', 'w') as file:
        json.dump(controlPoints, file, indent=4)

def main():
    make_curtains()
    
    

if __name__ == "__main__":
    main()