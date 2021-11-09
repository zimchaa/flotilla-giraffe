from bottle import request, response
from bottle import post, get, put
from bottle import static_file, route
import json
import time
import flotilla
import picamera
import sys

#flotilla setup
dock = flotilla.Client()
print("Client connected...")

while not dock.ready:
    pass

print("Finding modules...")

modMotion = dock.first(flotilla.Motion)
modMotorLeft = dock.second(flotilla.Motor)
modMotorRight = dock.first(flotilla.Motor)
modRainbow = dock.first(flotilla.Rainbow)

intCurrentSpeedLeft = 0
intCurrentSpeedRight = 0
global intCurrentThrust 
intCurrentThrust = 0
global intCurrentDiff
intCurrentDiff = 0

if modMotorLeft is None:
    print("Left Motor - error")
    blnMotor = False
    intMotorLeftSpeed = 0
else:
    print("Left Motor - check")
    blnMotor = True
    intLeftMotorSpeed = 0
    
if modMotorRight is None:
    print("Right Motor - error")
    blnMotor = False
    intMotorRightSpeed = 0
else:
    print("Left Motor - check")
    blnMotor = True
    intMotorRightSpeed = 0

if modMotion is None:
    print("Motion / Telemetry - error")
    blnMotion = False
else:
    blnMotion = True
    print("Motion / Telemetry - check")
    
if modRainbow is None:
    print("Rainbow - error")
    blnRainbow = False
else:
    print("Rainbow - check")
    blnRainbow = True
    
print("Flotilla setup - check")

def motor_speed_calc(intNewThrust, intNewDiff):
    
    #check the inputs are in the right range
    if intNewThrust > 100 or intNewThrust < -100:
        print("Thrust out of range: {}".format(intNewThrust))
        intNewThrust = 0
        
    if intNewDiff > 100 or intNewDiff < -100:
        print("Differential out of range: {}".format(intNewDiff))
        intNewDiff = 0
    
    print("New thrust/diff: {}/{}".format(intNewThrust, intNewDiff))
    
    intNewSpeed = int((intNewThrust * 63) / 100) 
    
    calcDiffRight = 100
    calcDiffLeft = 100
    
    if intNewDiff > 0:
        #Left motor affected
        calcDiffLeft = (50 - intNewDiff) * 2
        
    elif intNewDiff < 0:
        #Right motor affected
        #denegativeise the number
        calcDiffRight = (50 - (intNewDiff * -1)) * 2
        
    else:
        #something weird
        print("something odd happened")
        
    calcDiffPerc = (50 - intNewDiff) * 2
    print("Differential percentage left/right: {}/{}".format(calcDiffLeft, calcDiffRight))

    intNewSpeedLeft = int((intNewSpeed * calcDiffLeft) / 100)
    intNewSpeedRight = int((intNewSpeed * calcDiffRight) / 100)
    
    return {"left": intNewSpeedLeft, "right": intNewSpeedRight}


@put('/rainbow/<numPixel:int>')
@put('/rainbow/<numPixel:int>/<intRed:int>/<intGreen:int>/<intBlue:int>/<fltBrightness:float>')
def light_handler(numPixel = 6, intRed = 255, intGreen = 255, intBlue = 255, fltBrightness = 150.0):
    
    try:
        if blnRainbow:
            print("Current pixel colour/brightnesss: ")
            print(modRainbow.pixels)
            print(modRainbow.brightness)

            if numPixel == 6:
                print("Updated all pixels: R/G/B/Brightness: {}/{}/{}/{}".format(intRed, intGreen, intBlue, fltBrightness))
                modRainbow.set_all(intRed, intGreen, intBlue)
                modRainbow.set_brightness(fltBrightness)
                modRainbow.update()
            elif numPixel <= 4 and numPixel >= 0:
                print("Updated {} pixel: R/G/B/Brightness: {}/{}/{}/{}".format(numPixel, intRed, intGreen, intBlue, fltBrightness))
                modRainbow.set_pixel(numPixel, intRed, intGreen, intBlue)
                modRainbow.set_brightness(fltBrightness)
                modRainbow.update()
            else:
                modRainbow.set_brightness(0)
                modRainbow.update()
                print("Turned off all pixels")

            print("Updated pixel colour/brightness: ")
            print(modRainbow.pixels)
            print(modRainbow.brightness)

        else:
            print("Rainbow not working - psuedo response")
    
    except:
        print("Rainbow error: {} / {}".format(sys.exc_info()[0],  sys.exc_info()[1]))
    
    response.headers['Content-Type'] = 'application/json'
    return json.dumps({"pixels": modRainbow.pixels, "brightness": modRainbow.brightness})


@get('/telemetry')
def telemetry_handler():
    
    #initialise varTelemetry
    varTelemetry = {"x": 0, "y": 0, "z": 0, "heading": 0, "motorspeeds": {"left": 0, "right": 0}, "status": "bad"}
    
    if blnMotor:
        dictMotorSpeeds = {"left": modMotorLeft.speed, "right": modMotorRight.speed}
    else:
        dictMotorSpeeds = {"left": 0, "right": 0}

    try:
        #parse input
        if blnMotion:
            varTelemetry = {"x": modMotion.x, "y": modMotion.y, "z": modMotion.z, "heading": modMotion.heading, "motorspeeds": dictMotorSpeeds, "status": "good"}
        # else: 
            # print("blnMotion: {} / blnMotor: {}".format(blnMotion, blnMotor))

    except:
        print("motion error, returning defaults")
        
    response.headers['Content-Type'] = 'application/json'
    return json.dumps(varTelemetry)        
        
@get('/thrust/')
def get_thrust_handler():

    response.headers['Content-Type'] = 'application/json'
    return json.dumps({"thrust": intCurrentThrust})

@get('/diff/')
def get_diff_handler():

    response.headers['Content-Type'] = 'application/json'
    return json.dumps({"diff": intCurrentDiff})

@put('/thrust/<intThrust:int>/diff/<intDiff:int>')
def thrustdiff_handler(intThrust = 0, intDiff = 0):
    
    varThrustDiff = {}
    
    try: 
        if blnMotor:
            print("Current motor speeds L/R: {}/{}".format(modMotorLeft.speed, modMotorRight.speed))
            
            newSpeeds = motor_speed_calc(intThrust, intDiff)
            
            print("New speeds: {}".format(newSpeeds))
            
            modMotorLeft.set_speed(-newSpeeds["left"])
            modMotorRight.set_speed(newSpeeds["right"])
            
            print("New motor speeds L/R: {}/{}".format(modMotorLeft.speed, modMotorRight.speed))
            
            varThrustDiff = {"motorspeeds": newSpeeds, "thrust": intThrust, "diff": intDiff}
            
            # set the global vars to be returned
            intCurrentThrust = intThrust
            intCurrentDiff = intDiff

        else:
            print("No motors")

    except: 
        print("Motor (Thrust) error: {} / {}".format(sys.exc_info()[0], sys.exc_info()[1]))

    response.headers['Content-Type'] = 'application/json'
    return json.dumps(varThrustDiff)


@route('/<filepath:path>')
def server_static(filepath):
    return static_file(filepath, root='/var/www/html')