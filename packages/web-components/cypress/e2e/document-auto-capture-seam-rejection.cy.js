describe('Document auto-capture seam rejection', () => {
  const importSeamRejection = (win) =>
    win.eval(
      "import('/lib/components/document/src/document-auto-capture/detection/seamRejection.ts')",
    );

  // A 300x200 card-shaped quad. Edges (in corner order):
  //  0: top    (100,100)->(400,100)  len 300
  //  1: right  (400,100)->(400,300)  len 200
  //  2: bottom (400,300)->(100,300)  len 300
  //  3: left   (100,300)->(100,100)  len 200
  const cardQuad = [
    { x: 100, y: 100 },
    { x: 400, y: 100 },
    { x: 400, y: 300 },
    { x: 100, y: 300 },
  ];

  beforeEach(() => {
    cy.visit('/');
  });

  it('keeps a clean card quad when there are no straight lines', () => {
    cy.window().then(async (win) => {
      const mod = await importSeamRejection(win);
      expect(mod.isSeamFalseQuad(cardQuad, [])).to.equal(false);
      const { seamEdgeCount } = mod.classifyEdgesOnThroughLines(cardQuad, []);
      expect(seamEdgeCount).to.equal(0);
    });
  });

  it('keeps an edge whose collinear line ends at the corners (a real card edge)', () => {
    cy.window().then(async (win) => {
      const mod = await importSeamRejection(win);
      // Segment exactly matches the top edge — no overshoot past the corners.
      const segments = [{ x1: 100, x2: 400, y1: 100, y2: 100 }];
      const { seamEdgeCount } = mod.classifyEdgesOnThroughLines(
        cardQuad,
        segments,
      );
      expect(seamEdgeCount).to.equal(0);
      expect(mod.isSeamFalseQuad(cardQuad, segments)).to.equal(false);
    });
  });

  it('flags one edge but keeps the quad with a single through-line (count < 2)', () => {
    cy.window().then(async (win) => {
      const mod = await importSeamRejection(win);
      // A through-line on the top edge: overshoots both x=100 and x=400 by
      // well over 15% of the 300px edge.
      const segments = [{ x1: 20, x2: 480, y1: 100, y2: 100 }];
      const { seamEdgeCount, perEdge } = mod.classifyEdgesOnThroughLines(
        cardQuad,
        segments,
      );
      expect(seamEdgeCount).to.equal(1);
      expect(perEdge[0]).to.equal(true);
      expect(mod.isSeamFalseQuad(cardQuad, segments)).to.equal(false);
    });
  });

  it('rejects a quad framed by two opposite through-lines (parquet seams)', () => {
    cy.window().then(async (win) => {
      const mod = await importSeamRejection(win);
      const segments = [
        { x1: 20, x2: 480, y1: 100, y2: 100 }, // through top edge
        { x1: 20, x2: 480, y1: 300, y2: 300 }, // through bottom edge
      ];
      const { seamEdgeCount } = mod.classifyEdgesOnThroughLines(
        cardQuad,
        segments,
      );
      expect(seamEdgeCount).to.equal(2);
      expect(mod.isSeamFalseQuad(cardQuad, segments)).to.equal(true);
    });
  });

  it('ignores parallel lines that are offset from the edge (not collinear)', () => {
    cy.window().then(async (win) => {
      const mod = await importSeamRejection(win);
      // Long horizontal lines, but 30px away from the top/bottom edges — beyond
      // the perpendicular distance tolerance, so they are not seam matches.
      const segments = [
        { x1: 20, x2: 480, y1: 130, y2: 130 },
        { x1: 20, x2: 480, y1: 270, y2: 270 },
      ];
      expect(mod.isSeamFalseQuad(cardQuad, segments)).to.equal(false);
    });
  });

  it('counts a near-wall line end as an overshoot only when ROI size is given', () => {
    cy.window().then(async (win) => {
      const mod = await importSeamRejection(win);
      // A quad hugging the left ROI wall (corner at x=10).
      const nearWallQuad = [
        { x: 10, y: 100 },
        { x: 310, y: 100 },
        { x: 310, y: 300 },
        { x: 10, y: 300 },
      ];
      // Top edge len 300. The line barely passes corner A (x=10 → x=2, only
      // 8px < the 45px fractional threshold) but REACHES the left ROI wall,
      // and overshoots corner B fractionally (x=360 > 310+45).
      const segments = [{ x1: 2, x2: 360, y1: 100, y2: 100 }];
      const without = mod.classifyEdgesOnThroughLines(nearWallQuad, segments);
      expect(without.perEdge[0]).to.equal(false);
      const withRoi = mod.classifyEdgesOnThroughLines(nearWallQuad, segments, {
        roiH: 400,
        roiW: 400,
      });
      expect(withRoi.perEdge[0]).to.equal(true);
    });
  });
});
