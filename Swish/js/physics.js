import * as CANNON from 'cannon';

/** PHYSICS SETUP **/
export const world = new CANNON.World();
world.gravity.set(0, -12, 0); // Reduced gravity to make the ball "float" more and stay in the air longer

export const ballMat = new CANNON.Material("ball");
export const groundMat = new CANNON.Material("ground");
// Increased restitution (bounce) to 0.9 to make the ball friendlier off the backboard
export const bounceContact = new CANNON.ContactMaterial(ballMat, groundMat, { restitution: 0.9, friction: 0.2 });
world.addContactMaterial(bounceContact);
