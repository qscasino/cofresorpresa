function makeSanta({ x, z, s = 1.0 }) {
  const santa = new THREE.Group();
  santa.position.set(x, 0, z);
  santa.rotation.y = -0.55;

  const red      = new THREE.MeshStandardMaterial({ color: 0xc61f2f, roughness: 0.75, metalness: 0.05 });
  const redDark  = new THREE.MeshStandardMaterial({ color: 0x9b1422, roughness: 0.80, metalness: 0.05 });
  const white    = new THREE.MeshStandardMaterial({ color: 0xf6f2e9, roughness: 0.85, metalness: 0.0  });
  const skin     = new THREE.MeshStandardMaterial({ color: 0xf0c9a6, roughness: 0.90, metalness: 0.0  });
  const cheekMat = new THREE.MeshStandardMaterial({ color: 0xf7b49d, roughness: 0.95, metalness: 0.0  });
  const black    = new THREE.MeshStandardMaterial({ color: 0x111318, roughness: 0.60, metalness: 0.15 });
  const goldBelt = new THREE.MeshStandardMaterial({ color: 0xffd36a, roughness: 0.35, metalness: 0.85 });

  // BOTAS
  const bootGeo = new THREE.BoxGeometry(0.32 * s, 0.20 * s, 0.45 * s);
  const bootL = new THREE.Mesh(bootGeo, black);
  bootL.position.set(-0.22 * s, 0.10 * s, 0.10 * s);
  santa.add(bootL);
  const bootR = bootL.clone();
  bootR.position.x = 0.22 * s;
  santa.add(bootR);

  // PIERNAS
  const legGeo = new THREE.CylinderGeometry(0.13 * s, 0.15 * s, 0.38 * s, 10);
  const legL = new THREE.Mesh(legGeo, redDark);
  legL.position.set(-0.22 * s, 0.40 * s, 0.0);
  santa.add(legL);
  const legR = legL.clone();
  legR.position.x = 0.22 * s;
  santa.add(legR);

  // CUERPO
  const belly = new THREE.Mesh(new THREE.SphereGeometry(0.62 * s, 24, 24), red);
  belly.position.y = 0.95 * s;
  santa.add(belly);

  const chest = new THREE.Mesh(new THREE.SphereGeometry(0.52 * s, 24, 24), red);
  chest.position.set(0, 1.30 * s, 0);
  santa.add(chest);

  // FAJA
  const belt = new THREE.Mesh(new THREE.CylinderGeometry(0.55 * s, 0.55 * s, 0.18 * s, 24), black);
  belt.position.set(0, 1.00 * s, 0);
  santa.add(belt);

  const buckle = new THREE.Mesh(new THREE.BoxGeometry(0.28 * s, 0.20 * s, 0.05 * s), goldBelt);
  buckle.position.set(0, 1.00 * s, 0.35 * s);
  santa.add(buckle);

  // ===== HEAD GROUP =====
  const headRadius = 0.38 * s;

  const headGroup = new THREE.Group();
  headGroup.position.set(0, 1.80 * s, 0);
  headGroup.rotation.y = 0.08; // un toque menos que antes (más “amigable” y centrado)
  santa.add(headGroup);

  const head = new THREE.Mesh(new THREE.SphereGeometry(headRadius, 28, 28), skin);
  headGroup.add(head);

  // ===== FACE GROUP =====
  const faceGroup = new THREE.Group();
  faceGroup.position.set(0, 0.02 * s, headRadius * 0.82);
  headGroup.add(faceGroup);

  // OJOS (más cálidos: pupila convergente + párpado)
  const eyeWhiteGeo = new THREE.SphereGeometry(0.082 * s, 16, 16);
  const eyeWhiteMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.22, metalness: 0.0 });

  const irisGeo = new THREE.SphereGeometry(0.045 * s, 14, 14);
  const irisMat = new THREE.MeshStandardMaterial({ color: 0x1b1b1b, roughness: 0.35, metalness: 0.0 });

  const pupilGeo = new THREE.SphereGeometry(0.030 * s, 12, 12);
  const pupilMat = new THREE.MeshStandardMaterial({ color: 0x000000, roughness: 0.25, metalness: 0.0 });

  function makeEye(xOff) {
    const g = new THREE.Group();
    g.position.set(xOff, 0.06 * s, 0);

    const sclera = new THREE.Mesh(eyeWhiteGeo, eyeWhiteMat);
    sclera.scale.set(1.0, 0.82, 0.90);
    g.add(sclera);

    const iris = new THREE.Mesh(irisGeo, irisMat);
    iris.position.z = 0.03 * s;
    g.add(iris);

    const pupil = new THREE.Mesh(pupilGeo, pupilMat);
    // pupila “mirada cálida”: un toque hacia adentro + un toque abajo + adelante
    pupil.position.set(-Math.sign(xOff) * 0.010 * s, -0.008 * s, 0.070 * s);
    g.add(pupil);

    // Párpado superior (tapa un poco el blanco → mirada más suave)
    const lid = new THREE.Mesh(new THREE.SphereGeometry(0.086 * s, 16, 16), skin);
    lid.scale.set(1.02, 0.55, 0.90);
    lid.position.set(0, 0.030 * s, 0.020 * s);
    g.add(lid);

    return g;
  }

  faceGroup.add(makeEye(-0.14 * s));
  faceGroup.add(makeEye( 0.14 * s));

  // CEJAS (ligeramente más “relajadas”)
  const browGeo = new THREE.TorusGeometry(0.10 * s, 0.022 * s, 10, 22, Math.PI * 0.80);
  const browMat = new THREE.MeshStandardMaterial({ color: 0xf7f3e6, roughness: 0.78, metalness: 0.0 });

  const browL = new THREE.Mesh(browGeo, browMat);
  browL.position.set(-0.14 * s, 0.145 * s, 0.02 * s);
  browL.rotation.set(Math.PI / 2, 0, Math.PI * 0.04);
  faceGroup.add(browL);

  const browR = browL.clone();
  browR.position.x = 0.14 * s;
  browR.rotation.z = -Math.PI * 0.04;
  faceGroup.add(browR);

  // NARIZ
  const nose = new THREE.Mesh(new THREE.SphereGeometry(0.088 * s, 16, 16), skin);
  nose.position.set(0, -0.02 * s, 0.12 * s);
  nose.scale.set(1.0, 0.85, 1.05);
  faceGroup.add(nose);

  // MEJILLAS
  const cheekGeo = new THREE.SphereGeometry(0.065 * s, 16, 16);
  const cheekL = new THREE.Mesh(cheekGeo, cheekMat);
  cheekL.position.set(-0.20 * s, -0.06 * s, 0.06 * s);
  faceGroup.add(cheekL);
  const cheekR = cheekL.clone();
  cheekR.position.x = 0.20 * s;
  faceGroup.add(cheekR);

  // SONRISA (simple, muy efectiva)
  const mouthMat = new THREE.MeshStandardMaterial({ color: 0x3b1a1a, roughness: 0.6, metalness: 0.0 });
  const mouth = new THREE.Mesh(
    new THREE.TorusGeometry(0.095 * s, 0.014 * s, 10, 24, Math.PI * 0.85),
    mouthMat
  );
  mouth.position.set(0, -0.135 * s, 0.115 * s);
  mouth.rotation.set(Math.PI / 2, 0, Math.PI); // curva hacia arriba
  faceGroup.add(mouth);

  // ===== BARBA =====
  const beard = new THREE.Mesh(new THREE.SphereGeometry(0.42 * s, 24, 24), white);
  beard.position.set(0, -0.26 * s, 0.10 * s);
  beard.scale.set(1.05, 0.52, 1.05);
  headGroup.add(beard);

  // BIGOTE
  const moustacheGeo = new THREE.SphereGeometry(0.15 * s, 16, 16);
  const moustacheL = new THREE.Mesh(moustacheGeo, white);
  moustacheL.position.set(-0.11 * s, -0.11 * s, headRadius * 0.92);
  moustacheL.scale.set(1.18, 0.60, 1.0);
  headGroup.add(moustacheL);
  const moustacheR = moustacheL.clone();
  moustacheR.position.x = 0.11 * s;
  headGroup.add(moustacheR);

  // ===== GORRO (calzado y menos torcido) =====
  const hatGroup = new THREE.Group();
  // más centrado y un poquito hacia adelante (para que “asiente” en la frente)
  hatGroup.position.set(0.00 * s, headRadius * 0.72, 0.03 * s);
  hatGroup.rotation.set(0, 0, 0); // nada de inclinación del grupo
  headGroup.add(hatGroup);

  const brim = new THREE.Mesh(
    new THREE.CylinderGeometry(headRadius * 1.10, headRadius * 1.08, 0.10 * s, 24),
    white
  );
  brim.position.y = 0.01 * s;
  brim.scale.y = 0.75;
  hatGroup.add(brim);

  const brimFur = new THREE.Mesh(
    new THREE.TorusGeometry(headRadius * 1.06, 0.035 * s, 10, 28),
    white
  );
  brimFur.rotation.x = Math.PI / 2;
  brimFur.position.y = 0.05 * s;
  brimFur.scale.set(1, 0.8, 1);
  hatGroup.add(brimFur);

  const hatCone = new THREE.Mesh(
    new THREE.ConeGeometry(headRadius * 0.95, 0.78 * s, 24),
    redDark
  );
  // más centrado y MENOS inclinado (así se ve “sobre la cabeza”)
  hatCone.position.set(0.02 * s, 0.40 * s, -0.02 * s);
  hatCone.rotation.z = 0.22; // antes 0.55 (muy torcido)
  hatCone.rotation.x = 0.05;
  hatGroup.add(hatCone);

  const hatPom = new THREE.Mesh(new THREE.SphereGeometry(0.12 * s, 16, 16), white);
  hatPom.position.set(0.24 * s, 0.80 * s, -0.04 * s);
  hatGroup.add(hatPom);

  // ===== HOMBROS + BRAZOS (sin “colgar”) =====
  const shoulderGeo = new THREE.SphereGeometry(0.16 * s, 16, 16);

  function buildArm(side /* -1 left, +1 right */, waving = false) {
    const armGroup = new THREE.Group();
    // pivot en hombro (pegado al torso)
    armGroup.position.set(0.50 * s * side, 1.43 * s, 0.06 * s);
    santa.add(armGroup);

    // hombro/manga para tapar unión
    const shoulder = new THREE.Mesh(shoulderGeo, redDark);
    shoulder.scale.set(1.15, 1.0, 1.05);
    armGroup.add(shoulder);

    // upper arm (más corto, arranca pegado al hombro)
    const upperArm = new THREE.Mesh(
      new THREE.CylinderGeometry(0.11 * s, 0.11 * s, 0.44 * s, 12),
      redDark
    );
    upperArm.rotation.z = Math.PI / 2;
    upperArm.position.x = 0.26 * s * side;
    armGroup.add(upperArm);

    // “cap” extra para que no se vea el cilindro cortado
    const sleeveCap = new THREE.Mesh(new THREE.SphereGeometry(0.12 * s, 14, 14), redDark);
    sleeveCap.position.x = 0.05 * s * side;
    sleeveCap.scale.set(1.2, 1.0, 1.0);
    armGroup.add(sleeveCap);

    const cuff = new THREE.Mesh(
      new THREE.CylinderGeometry(0.13 * s, 0.13 * s, 0.13 * s, 16),
      white
    );
    cuff.rotation.z = Math.PI / 2;
    cuff.position.x = 0.48 * s * side;
    armGroup.add(cuff);

    const hand = new THREE.Mesh(new THREE.SphereGeometry(0.12 * s, 16, 16), white);
    hand.position.x = 0.64 * s * side;
    armGroup.add(hand);

    // postura inicial (evita “colgado”)
    // levanta un poco y abre sutilmente
    armGroup.rotation.z = (waving ? 0.10 : 0.06) * side;
    armGroup.rotation.x = -0.06; // un toque hacia adelante (más natural)

    return armGroup;
  }

  // Izq quieto
  const armLGroup = buildArm(-1, false);

  // Der saludando (pivot en hombro → animación más real)
  const armRGroup = buildArm(+1, true);
  santa.userData.waveArm = armRGroup;

  // sombras
  santa.traverse(o => {
    if (o.isMesh) {
      o.castShadow = true;
      o.receiveShadow = true;
    }
  });

  ambience.add(santa);
  return santa;
}
