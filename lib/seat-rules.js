// Reglen på sædevalget: man må ikke efterlade et ledigt sæde helt alene
// (med et optaget sæde, en gang eller væggen på begge sider) - så kan ingen andre bruge det.
// Undtagelser, når det er den eneste mulighed:
//   - Man sidder samlet, og man kan ikke sidde samlet et andet sted uden.
//     Fx 3 personer, og der er kun 4 ledige sæder ved siden af hinanden.
//   - Det kan slet ikke undgås (fx når salen er næsten udsolgt).
//
// Bruges både på siden (SeatPicker) og i server action'en (reserveSeats), så reglen kun står ét sted.
// rows kommer fra getSeatMap(): [{ number, seats: [{ id, col, type, taken }] }]

// Finder "stykker" af ledige sæder, der sidder lige op ad hinanden i samme række.
// Et stykke stopper ved et sæde, der ikke er ledigt, og ved en gang.
// isFree(seat) afgør, om et sæde tæller som ledigt.
// Giver fx [[sæde 1, sæde 2, sæde 3], [sæde 6]]
function freeRuns(rows, isFree) {
  const runs = [];

  for (const row of rows) {
    const seats = [...row.seats].sort((a, b) => a.col - b.col);
    let run = [];
    let lastColumn = -Infinity; // den sidste kolonne, vi har set i rækken

    for (const seat of seats) {
      const free = isFree(seat);
      const nextToLast = seat.col === lastColumn + 1;

      // Ikke ledigt, eller der er en gang imellem -> stykket slutter her
      if (!free || !nextToLast) {
        if (run.length > 0) runs.push(run);
        run = [];
      }
      if (free) run.push(seat);

      lastColumn = seat.col;
    }

    if (run.length > 0) runs.push(run);
  }

  return runs;
}

// Kan man overhovedet vælge "quantity" sæder uden at efterlade et sæde alene?
// I et stykke med L ledige sæder kan man tage 0 … L sæder - bare ikke L - 1,
// for så bliver der præcis ét sæde tilbage. (Tager man fra kanten, er resten samlet.)
// Vi lægger stykkerne sammen og ser, om vi kan ramme præcis "quantity".
function canAvoidLoneSeats(rows, quantity) {
  const runs = freeRuns(rows, (seat) => !seat.taken);

  // Hvilke antal sæder kan vi nå op på? Vi starter med 0
  let reachable = new Set([0]);

  for (const { length } of runs) {
    const next = new Set(reachable);
    for (const sum of reachable) {
      for (let take = 1; take <= length; take++) {
        // Efterlader ét sæde alene - spring over (et stykke på 1 sæde var alene i forvejen)
        if (length >= 2 && take === length - 1) continue;
        if (sum + take <= quantity) next.add(sum + take);
      }
    }
    reachable = next;
  }

  return reachable.has(quantity);
}

// Sidder de valgte sæder samlet? (samme række og ingen huller imellem)
function isTogether(rows, selectedIds) {
  const seats = rows.flatMap((row) => row.seats).filter((seat) => selectedIds.includes(seat.id));
  const columns = seats.map((seat) => seat.col);
  const sameRow = seats.every((seat) => seat.row_number === seats[0].row_number);
  return sameRow && Math.max(...columns) - Math.min(...columns) === seats.length - 1;
}

// Hvor få sæder skal man mindst efterlade alene for at sidde samlet?
// Vi prøver alle steder i salen og tæller de sæder, der bliver alene til venstre og højre.
function fewestLoneSeatsTogether(rows, quantity) {
  let fewest = Infinity;

  for (const run of freeRuns(rows, (seat) => !seat.taken)) {
    for (let start = 0; start + quantity <= run.length; start++) {
      const left = start; // ledige til venstre
      const right = run.length - start - quantity; // ledige til højre
      const lone = (left === 1 ? 1 : 0) + (right === 1 ? 1 : 0);
      fewest = Math.min(fewest, lone);
    }
  }

  return fewest;
}

// Vælger "quantity" sæder til en, så tæt på midten af salen som muligt.
// Bruges, når man kommer fra "Vælg antal" til sædevalget - man kan selv ændre dem bagefter.
//   1. Helst sæder ved siden af hinanden i samme række, som ikke efterlader et sæde alene
//   2. Derefter sæder ved siden af hinanden, selvom de efterlader et sæde alene
//   3. Er der ingen, tager vi bare de ledige sæder, der er tættest på midten
// Handicappladser vælges ikke af sig selv.
export function findBestSeats(rows, quantity) {
  if (quantity === 0 || rows.length === 0) {
    return [];
  }

  // Midten af salen: den midterste række og den midterste kolonne
  const centerRow = (rows[0].number + rows[rows.length - 1].number) / 2;
  const columns = Math.max(...rows.flatMap((row) => row.seats.map((seat) => seat.col)));
  const centerColumn = (columns + 1) / 2;

  // Hvor langt er sæderne fra midten? (gennemsnittet af deres række og kolonne)
  function distanceToCenter(seats) {
    const row = seats.reduce((sum, seat) => sum + seat.row_number, 0) / seats.length;
    const column = seats.reduce((sum, seat) => sum + seat.col, 0) / seats.length;
    return Math.hypot(row - centerRow, column - centerColumn);
  }

  const isFreeStandard = (seat) => !seat.taken && seat.type === "standard";

  // Alle mulige blokke af "quantity" ledige sæder ved siden af hinanden
  const blocks = [];
  for (const run of freeRuns(rows, isFreeStandard)) {
    for (let start = 0; start + quantity <= run.length; start++) {
      const block = run.slice(start, start + quantity);
      const leavesLoneSeat = findLoneSeats(rows, block.map((seat) => seat.id), quantity).length > 0;
      blocks.push({ block, leavesLoneSeat, distance: distanceToCenter(block) });
    }
  }

  if (blocks.length > 0) {
    // Blokke uden et sæde alene først, og derefter den tætteste på midten
    blocks.sort((a, b) => a.leavesLoneSeat - b.leavesLoneSeat || a.distance - b.distance);
    return blocks[0].block;
  }

  // Ingen blok passer - tag de ledige sæder, der er tættest på midten, hver for sig
  return rows
    .flatMap((row) => row.seats)
    .filter(isFreeStandard)
    .sort((a, b) => distanceToCenter([a]) - distanceToCenter([b]))
    .slice(0, quantity);
}

// De sæder, som det valgte efterlader alene - og som man derfor skal undgå.
// Giver en tom liste, hvis valget er i orden, ikke er færdigt endnu,
// eller hvis det er den eneste mulighed (se øverst i filen).
//
//   rows        - fra getSeatMap()
//   selectedIds - de valgte sæders id'er
//   quantity    - hvor mange sæder man skal vælge
export function findLoneSeats(rows, selectedIds, quantity) {
  // Vi tjekker først, når alle sæderne er valgt
  if (selectedIds.length !== quantity) {
    return [];
  }

  const selected = new Set(selectedIds);

  // Hvor langt var hvert sædes stykke, før man valgte? (Sæder, der var alene i forvejen, er ikke ens skyld)
  const runLengthBefore = new Map();
  for (const run of freeRuns(rows, (seat) => !seat.taken)) {
    for (const seat of run) {
      runLengthBefore.set(seat.id, run.length);
    }
  }

  // Stykker på ét sæde efter valget, som var længere før = sæder, valget har efterladt alene
  const lone = freeRuns(rows, (seat) => !seat.taken && !selected.has(seat.id))
    .filter((run) => run.length === 1 && runLengthBefore.get(run[0].id) >= 2)
    .map((run) => run[0]);

  // Ingen sæder alene -> i orden
  if (lone.length === 0) {
    return [];
  }

  // Man sidder samlet, og det kan ikke gøres bedre -> i orden
  if (isTogether(rows, selectedIds) && lone.length <= fewestLoneSeatsTogether(rows, quantity)) {
    return [];
  }

  // Det kan slet ikke undgås -> i orden
  if (!canAvoidLoneSeats(rows, quantity)) {
    return [];
  }

  return lone;
}
