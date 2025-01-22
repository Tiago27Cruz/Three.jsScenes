import * as THREE from 'three';

class MyRoute{
    static Name = {
        TRACK1: 0,
        TRACK2: 1,
        PROPS1: 2,
        PROPS2: 3,
        MARIO: 4,
        LUIGI: 5,
        LEGO: 6,
        RMYSTERIO: 7
    }
    /**
     * Constructs a route
     * @param {MyRoute.Name} name - Name of the route.
     */
    constructor(name){
        // Create a map for the routes so it's easily scalable
        this.name = name;
        this.points = null;
        this.build();
    }
    /**
     * builds the route points
     */
    build(){
        switch(this.name){
            case MyRoute.Name.TRACK1:{
                this.points = [
                    new THREE.Vector3(0, 0, 0),
                    new THREE.Vector3(10, 0, 0),
                    new THREE.Vector3(16, 0, 6),
                    new THREE.Vector3(16, 0, 22),
                    new THREE.Vector3(12, 0, 28),
                    new THREE.Vector3(8, 0, 28),
                    new THREE.Vector3(4, 0, 16),
                    new THREE.Vector3(2, 0, 12),
                    new THREE.Vector3(-2, 0, 12),
                    new THREE.Vector3(-4, 0, 16),
                    new THREE.Vector3(-8, 0, 28),
                    new THREE.Vector3(-12, 0, 28),
                    new THREE.Vector3(-16, 0, 22),
                    new THREE.Vector3(-16, 0, 6),
                    new THREE.Vector3(-10, 0, 0),
                    new THREE.Vector3(0, 0, 0)
                    //new THREE.Vector3(5, 0, 5)
                ];
                break;
            }
            case MyRoute.Name.TRACK2:{
                this.points = [
                    new THREE.Vector3(-5, 0, 5),
                    new THREE.Vector3(0, 0, 0),
                    new THREE.Vector3(5, 0, 5),
                    new THREE.Vector3(0, 0, 10),
                    new THREE.Vector3(-5, 0, 5)
                ];
                break;
            }
            case MyRoute.Name.PROPS1:{
                this.points = [
                    new THREE.Vector3(6.5 * 2, 3, 1.5 * 2),
                    new THREE.Vector3(-2 * 2, 2, 7.7 * 2),
                    new THREE.Vector3(-7.5 * 2, 4, 8.5 * 2),
                    new THREE.Vector3(-8.7 * 2, 1, 11 * 2)
                ]
                break;
            }
            case MyRoute.Name.PROPS2:{
                this.points = [
                    new THREE.Vector3(4.4 * 2, 3, -0.5 * 2),
                    new THREE.Vector3(3.4 * 2, 2, 12.2 * 2),
                    new THREE.Vector3(-6.7 * 2, 4, 12.4 * 2)
                ]
                break;
            }
            case MyRoute.Name.MARIO: {
                this.points = [
                    new THREE.Vector3(3.5 * 2,      1.5,    0), //1
                    new THREE.Vector3(5 * 2,        3,      0.3 * 2), //2
                    new THREE.Vector3(6 * 2,        1.5,    1 * 2), //3
                    new THREE.Vector3(7 * 2,        4.5,    2 * 2), //4
                    new THREE.Vector3(8 * 2,        6,      5 * 2), //5
                    new THREE.Vector3(8 * 2,        4.5,    10 * 2), //6
                    new THREE.Vector3(7 * 2,        3,      12 * 2), //7
                    new THREE.Vector3(6 * 2,        3,      13.3 * 2), //8
                    new THREE.Vector3(5 * 2,        1.5,    13.7 * 2), //9
                    new THREE.Vector3(4 * 2,        1.5,    13.3 * 2), //10
                    new THREE.Vector3(3.5 * 2,       3,     12 * 2), //11
                    new THREE.Vector3(3 * 2,        4.5,    10 * 2), //12
                    new THREE.Vector3(1 * 2,        6,      6.7 * 2), //13
                    new THREE.Vector3(0.3 * 2,      6,      6.3 * 2), //14
                    new THREE.Vector3(-0.5 * 2,     6,      6.4 * 2), //15
                    new THREE.Vector3(-1 * 2,       3,      7 * 2), //16
                    new THREE.Vector3(-1.8 * 2,     6,      8.4 * 2), //17
                    new THREE.Vector3(-3 * 2,       6,      11 * 2), //18
                    new THREE.Vector3(-3.5 * 2,     6,      12.5 * 2), //19
                    new THREE.Vector3(-4.3 * 2,     4.5,    13.7 * 2), //20
                    new THREE.Vector3(-5 * 2,       4.5,    14 * 2), //21
                    new THREE.Vector3(-5.7 * 2,     6,      13.9 * 2), //22
                    new THREE.Vector3(-6.3 * 2,     4.5,    13.5 * 2), //23
                    new THREE.Vector3(-7 * 2,       6,      12 * 2), //24
                    new THREE.Vector3(-7.7 * 2,     4.5,    10 * 2), //25
                    new THREE.Vector3(-8 * 2,       6,      6.5 * 2), //26
                    new THREE.Vector3(-7.8 * 2,     4.5,    3.2 * 2), //27
                    new THREE.Vector3(-6.9 * 2,     3,      1.5 * 2), //28
                    new THREE.Vector3(-5 * 2,       1.5,    0), //29
                    new THREE.Vector3(-1 * 2,       1.5,    0) //30
                ];
                break;
            }
            case MyRoute.Name.LUIGI: {
                this.points = [
                    new THREE.Vector3(3.5 * 2,      1.5,    0), //1
                    new THREE.Vector3(5 * 2,        3,      0.3 * 2), //2
                    new THREE.Vector3(6 * 2,        4.5,    1 * 2), //3
                    new THREE.Vector3(7 * 2,        6,    2 * 2), //4
                    new THREE.Vector3(8 * 2,        6,      5 * 2), //5
                    new THREE.Vector3(8 * 2,        6,    10 * 2), //6
                    new THREE.Vector3(7 * 2,        6,      12 * 2), //7
                    new THREE.Vector3(6 * 2,        6,      13.3 * 2), //8
                    new THREE.Vector3(5 * 2,        6,    13.7 * 2), //9
                    new THREE.Vector3(4 * 2,        6,    13.3 * 2), //10
                    new THREE.Vector3(3.5 * 2,      6,     12 * 2), //11
                    new THREE.Vector3(3 * 2,        6,    10 * 2), //12
                    new THREE.Vector3(1 * 2,        6,      6.7 * 2), //13
                    new THREE.Vector3(0.3 * 2,      6,      6.3 * 2), //14
                    new THREE.Vector3(-0.5 * 2,     4.5,      6.4 * 2), //15
                    new THREE.Vector3(-1 * 2,       4.5,      7 * 2), //16
                    new THREE.Vector3(-1.8 * 2,     4.5,      8.4 * 2), //17
                    new THREE.Vector3(-3 * 2,       4.5,      11 * 2), //18
                    new THREE.Vector3(-3.5 * 2,     4.5,      12.5 * 2), //19
                    new THREE.Vector3(-4.3 * 2,     4.5,    13.7 * 2), //20
                    new THREE.Vector3(-5 * 2,       4.5,    14 * 2), //21
                    new THREE.Vector3(-5.7 * 2,     6,      13.9 * 2), //22
                    new THREE.Vector3(-6.3 * 2,     6,    13.5 * 2), //23
                    new THREE.Vector3(-7 * 2,       6,      12 * 2), //24
                    new THREE.Vector3(-7.7 * 2,     4.5,    10 * 2), //25
                    new THREE.Vector3(-8 * 2,       4.5,      6.5 * 2), //26
                    new THREE.Vector3(-7.8 * 2,     3,    3.2 * 2), //27
                    new THREE.Vector3(-6.9 * 2,     3,      1.5 * 2), //28
                    new THREE.Vector3(-5 * 2,       1.5,    0), //29
                    new THREE.Vector3(-1 * 2,       1.5,    0) //30
                ];
                break;
            }
            case MyRoute.Name.LEGO: {
                this.points = [
                    new THREE.Vector3(3.5 * 2,      1.5,    0), //1
                    new THREE.Vector3(5 * 2,        1.5,      0.3 * 2), //2
                    new THREE.Vector3(6 * 2,        1.5,    1 * 2), //3
                    new THREE.Vector3(7 * 2,        1.5,    2 * 2), //4
                    new THREE.Vector3(8 * 2,        1.5,      5 * 2), //5
                    new THREE.Vector3(8 * 2,        1.5,    10 * 2), //6
                    new THREE.Vector3(7 * 2,        1.5,      12 * 2), //7
                    new THREE.Vector3(6 * 2,        1.5,      13.3 * 2), //8
                    new THREE.Vector3(5 * 2,        1.5,    13.7 * 2), //9
                    new THREE.Vector3(4 * 2,        1.5,    13.3 * 2), //10
                    new THREE.Vector3(3.5 * 2,       3,     12 * 2), //11
                    new THREE.Vector3(3 * 2,        4.5,    10 * 2), //12
                    new THREE.Vector3(1 * 2,        4.5,      6.7 * 2), //13
                    new THREE.Vector3(0.3 * 2,      4.5,      6.3 * 2), //14
                    new THREE.Vector3(-0.5 * 2,     4.5,      6.4 * 2), //15
                    new THREE.Vector3(-1 * 2,       4.5,      7 * 2), //16
                    new THREE.Vector3(-1.8 * 2,     3,      8.4 * 2), //17
                    new THREE.Vector3(-3 * 2,       3,      11 * 2), //18
                    new THREE.Vector3(-3.5 * 2,     3,      12.5 * 2), //19
                    new THREE.Vector3(-4.3 * 2,     4.5,    13.7 * 2), //20
                    new THREE.Vector3(-5 * 2,       4.5,    14 * 2), //21
                    new THREE.Vector3(-5.7 * 2,     4.5,      13.9 * 2), //22
                    new THREE.Vector3(-6.3 * 2,     4.5,    13.5 * 2), //23
                    new THREE.Vector3(-7 * 2,       3,      12 * 2), //24
                    new THREE.Vector3(-7.7 * 2,     3,    10 * 2), //25
                    new THREE.Vector3(-8 * 2,       3,      6.5 * 2), //26
                    new THREE.Vector3(-7.8 * 2,     3,    3.2 * 2), //27
                    new THREE.Vector3(-6.9 * 2,     1.5,      1.5 * 2), //28
                    new THREE.Vector3(-5 * 2,       1.5,    0), //29
                    new THREE.Vector3(-1 * 2,       1.5,    0) //30
                ];
                break;
            }
            case MyRoute.Name.RMYSTERIO: {
                this.points = [
                    new THREE.Vector3(3.5 * 2,      1.5,    0), //1
                    new THREE.Vector3(5 * 2,        3,      0.3 * 2), //2
                    new THREE.Vector3(6 * 2,        3,    1 * 2), //3
                    new THREE.Vector3(7 * 2,        3,    2 * 2), //4
                    new THREE.Vector3(8 * 2,        6,      5 * 2), //5
                    new THREE.Vector3(8 * 2,        1,    10 * 2), //6
                    new THREE.Vector3(7 * 2,        9,      12 * 2), //7
                    new THREE.Vector3(6 * 2,        6,      13.3 * 2), //8
                    new THREE.Vector3(5 * 2,        1,    13.7 * 2), //9
                    new THREE.Vector3(4 * 2,        9,    13.3 * 2), //10
                    new THREE.Vector3(3.5 * 2,      3,     12 * 2), //11
                    new THREE.Vector3(3 * 2,        3,    10 * 2), //12
                    new THREE.Vector3(1 * 2,        3,      6.7 * 2), //13
                    new THREE.Vector3(0.3 * 2,      3,      6.3 * 2), //14
                    new THREE.Vector3(-0.5 * 2,     3,      6.4 * 2), //15
                    new THREE.Vector3(-1 * 2,       3,      7 * 2), //16
                    new THREE.Vector3(-1.8 * 2,     3,      8.4 * 2), //17
                    new THREE.Vector3(-3 * 2,       3,      11 * 2), //18
                    new THREE.Vector3(-3.5 * 2,     3,      12.5 * 2), //19
                    new THREE.Vector3(-4.3 * 2,     4.5,    13.7 * 2), //20
                    new THREE.Vector3(-5 * 2,       6,    14 * 2), //21
                    new THREE.Vector3(-5.7 * 2,     1,      13.9 * 2), //22
                    new THREE.Vector3(-6.3 * 2,     9,    13.5 * 2), //23
                    new THREE.Vector3(-7 * 2,       6,      12 * 2), //24
                    new THREE.Vector3(-7.7 * 2,     1,    10 * 2), //25
                    new THREE.Vector3(-8 * 2,       9,      6.5 * 2), //26
                    new THREE.Vector3(-7.8 * 2,     4.5,    3.2 * 2), //27
                    new THREE.Vector3(-6.9 * 2,     3,      1.5 * 2), //28
                    new THREE.Vector3(-5 * 2,       3,    0), //29
                    new THREE.Vector3(-1 * 2,       1.5,    0) //30
                ];
                break;
            }
            default:{
                console.warn("The route name " + this.name + " doesn't exist");
            }
        }
    }


}

export { MyRoute };