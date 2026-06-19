/* ============================================================
   CASE STUDY DATA + RENDERER
   Each project routes to case-study.html?p=<id>
   ============================================================ */
(function () {
  const ACCENT = 'var(--accent)', GREEN = 'var(--green)', AMBER = 'var(--amber)', RED = 'var(--red)';
  const motifs = {
    aigraph: `<svg viewBox="0 0 240 130" fill="none"><path d="M16 104 C 60 104, 76 40, 120 44 S 196 32, 224 24" stroke="${ACCENT}" stroke-width="4" stroke-linecap="round"/><circle cx="120" cy="44" r="6" fill="${ACCENT}"/><circle cx="186" cy="40" r="14" stroke="${ACCENT}" stroke-width="4"/><path d="m196 50 12 12" stroke="${ACCENT}" stroke-width="4" stroke-linecap="round"/></svg>`,
    lock: `<svg viewBox="0 0 240 130" fill="none"><rect x="86" y="56" width="68" height="56" rx="11" stroke="${RED}" stroke-width="4.5"/><path d="M98 56V44a22 22 0 0 1 44 0v12" stroke="${RED}" stroke-width="4.5"/><circle cx="120" cy="80" r="7" fill="${RED}"/><path d="M120 87v12" stroke="${RED}" stroke-width="4.5" stroke-linecap="round"/></svg>`,
    shield: `<svg viewBox="0 0 240 130" fill="none"><path d="M120 18 L166 34 V70 C166 96 146 110 120 118 C94 110 74 96 74 70 V34 Z" stroke="${ACCENT}" stroke-width="4.5" stroke-linejoin="round"/><path d="M104 66 l11 11 22-24" stroke="${ACCENT}" stroke-width="4.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
    network: `<svg viewBox="0 0 240 130" fill="none"><g stroke="${GREEN}" stroke-width="3.2"><line x1="120" y1="66" x2="56" y2="34"/><line x1="120" y1="66" x2="190" y2="34"/><line x1="120" y1="66" x2="50" y2="100"/><line x1="120" y1="66" x2="196" y2="100"/><line x1="120" y1="66" x2="120" y2="22"/></g><g fill="${GREEN}"><circle cx="120" cy="66" r="11"/><circle cx="56" cy="34" r="8"/><circle cx="190" cy="34" r="8"/><circle cx="50" cy="100" r="8"/><circle cx="196" cy="100" r="8"/><circle cx="120" cy="22" r="8"/></g></svg>`,
    aperture: `<svg viewBox="0 0 240 130" fill="none"><g stroke="${AMBER}" stroke-width="4" fill="none"><circle cx="120" cy="65" r="40"/><circle cx="120" cy="65" r="15"/><path d="M120 25 L120 50M160 65 L135 65M120 105 L120 80M80 65 L105 65M148 37 L131 54M148 93 L131 76M92 93 L109 76M92 37 L109 54"/></g></svg>`,
    candles: `<svg viewBox="0 0 240 130" fill="none"><g stroke="${GREEN}" stroke-width="4" stroke-linecap="round"><path d="M72 28v74M104 44v52M136 20v86M168 50v44"/></g><g fill="${GREEN}"><rect x="64" y="48" width="16" height="34" rx="2"/><rect x="96" y="58" width="16" height="26" rx="2"/><rect x="128" y="40" width="16" height="44" rx="2"/><rect x="160" y="64" width="16" height="22" rx="2"/></g></svg>`,
    star: `<svg viewBox="0 0 240 130" fill="none"><path d="M120 22 l16 36 39 4 -29 27 8 39 -34-20 -34 20 8-39 -29-27 39-4z" stroke="${AMBER}" stroke-width="4" fill="none" stroke-linejoin="round"/></svg>`,
    globe: `<svg viewBox="0 0 240 130" fill="none"><g stroke="${GREEN}" stroke-width="3.2"><circle cx="120" cy="65" r="44"/><ellipse cx="120" cy="65" rx="18" ry="44"/><path d="M76 65h88M86 43h68M86 87h68"/></g></svg>`,
  };

  const CASES = {
    deca: {
      triad: {build:"Created the Business Partner Network and the competitive-prep systems behind the wins.",biz:"DECA is business itself \u2014 finance, marketing, and entrepreneurship, under real competition.",lead:"Elected by 18,000+ members; led a chapter to +200% international success."},
      title: 'Florida DECA', motif: 'network',
      heroImg: 'assets/photos/deca-stage.jpg',
      heroPos: 'center 50%',
      gallery: ['assets/photos/deca-stage.jpg','assets/photos/deca-arena.jpg','assets/photos/deca-team.jpg'],
      tags: ['Business', 'Leadership'],
      sub: 'Elected Florida DECA Executive Vice President by 18,000+ members.',
      facts: [['Role','Executive VP'],['Elected by','18,000+ members'],['Platform','The DECA DAWN'],['Org','Florida DECA']],
      sections: [
        { label:'Chapter Leadership', h:'Building the chapter.', checklist:["Earned a roleplay award in Business Finance (Top 10 Roleplay) at the International Conference.","Took 2nd place in Entrepreneurship Team Decision Making at States.","Boosted competitive success by <b>200%</b> through trainings.","Led the team to its first completed chapter campaign.","Planned and executed the Speaker Series.","Formed a Business Partner Network and provided internships."] },
        { label:'The platform', h:'The DECA DAWN.', body:["My parents named me Nishant, Sanskrit for &lsquo;Dawn.&rsquo; I ran for Florida DECA Executive Vice President on a platform built around four pillars &mdash; <b>The DECA DAWN</b> &mdash; serving 18,000 members through empathetic action."] },
        { label:'Actions, thus far.', h:'Actions, thus far.', checklist:["Launched the <b>FL DECA Resource Center</b>, a statewide library of fundraising blueprints, competition tools, and templates.","Rebuilt the Personal Business Plan into the <b>Personal Business Pathways</b>: Community Engagement, Career Development, Entrepreneurship, and Personal Growth.","Formed an <b>internship pathway</b> and an <b>entrepreneurial venture pathway</b> with dedicated officer mentors.","Created the <b>FL DECA Officer Training Call</b> to onboard new and continuing chapter officers.","Streamlined the <b>Chapter Business Plan</b> into seven base requirements and a no-video submission template.","Ran <b>statewide Helping Hands</b> service campaigns.","Led <b>educational-policy advocacy</b> outreach to model civic engagement for members.","Published the annual <b>Impact Report</b> with association awards, statistics, and stories.","Authored a full <b>mobile-app feasibility study</b> measuring member demand, funding, and risk.","Boosted competitive success by <b>200%</b> at CDS and produced ICDC prep, judge-perspective, and alumni series."] },
        { label:'In motion', h:'What\u2019s next.', checklist:["Rolling <b>Starter Packages</b>, admin / school-board presentation decks, and an <b>AI DECA Tutor</b> into the Resource Hub.","Producing an <b>ICDC Success Hub</b>, <b>Judge Perspective Series</b>, and <b>Alumni &amp; College Series</b> across socials and the Resource Hub.","Pitching a multi-year <b>DECA SMIF</b> plan to the association.","Expanding the <b>Business Partner Network</b> internships pathway with a year-two growth plan.","Growing <b>mentorship pairings</b> through district GroupMe families and CBP tasks."] },
      ], next: 'speech',
    },
    speech: {
      triad: {build:"Built the case prep, research, and tournament strategy.",biz:"Competition is a discipline \u2014 preparing an argument that has to win on the day.",lead:"Captain who mentored middle- and high-school speakers all the way to nationals."},
      title: 'Speech & Debate', motif: 'star', heroImg: 'assets/photos/speech-cover.jpg', heroPos: 'center 20%',
      tags: ['Leadership', 'Speaking'],
      sub: 'Speech Captain \u2014 4th at NCFL Nationals, and a coach to the next class of speakers.',
      facts: [['Role','Captain'],['NCFL','4th national'],['Rank','Top 50 in the U.S.'],['Qualifier','3\u00d7 national']],
      sections: [
        { label:'The approach', h:'Coach the room, not just compete in it.', body:["As Speech Captain I led prep and tournament strategy and mentored younger speakers."] },
        { label:'The outcome', h:'On the national stage.', checklist:["<b>Led the Speech team to a regional championship.</b>","<b>4th at NCFL Nationals</b> and Top 50 nationally.","<b>Beta National Speech Champion</b> and a 3\u00d7 National Qualifier.","<b>Runner-up</b> in the inaugural Ethics Bowl competition.","Mentored middle- and high-school speakers to their own tournament wins."] },
      ], next: 'beta',
    },
    beta: {
      triad: {build:"Built a service-event operation running 100+ events a year.",biz:"Raised $10,000+ and ran the operations of the largest club on campus.",lead:"Co-President leading a campus-wide service organization."},
      title: 'Senior Beta Club', motif: null,
      tags: ['Service', 'Leadership'],
      sub: 'Co-President of the largest club on campus \u2014 100+ service events a year.',
      facts: [['Role','Co-President'],['Events','100+/yr'],['Raised','$10,000+'],['Size','Largest on campus']],
      sections: [
        { label:'What Beta is', h:'Character, leadership, service, achievement.', body:["Beta Club is a community built on four principles: character, leadership, service, and achievement. Character is exhibiting the qualities of a person who brightens the world around them. Leaders are people who have a positive influence on those around them. Service is the voluntary act of providing for a community or group of people. Achievement is the drive to excel and grow."] },
        { label:'What we do', h:'Run service like a community.', checklist:["Planned, organized, and documented Beta service activities.", "Managed membership and funds and ensured participation.", "Hosted dinners for seniors at Hope Lodge.", "Stayed focused on the four pillars of Beta."] },
        { label:'The outcome', h:'Service at scale.', checklist:["Organized <b>80+ service activities</b> in a year.","Raised <b>$8,000+</b> for Relay for Life.","Members qualified to compete at the National Beta Convention."] },
      ], next: 'yis',
    },
    yis: {
      triad: {build:"Authored in-depth equity analyses and research.",biz:"Investing and valuation under a national analyst certification.",lead:"National board member serving on the outreach committee."},
      title: 'Young Investors Society', motif: 'candles',
      tags: ['Finance', 'Business'],
      sub: 'National Board Member & Certified Young Investment Analyst.',
      facts: [['Role','National Board'],['Cert','Young Investment Analyst'],['Work','Equity research'],['Committee','Outreach']],
      sections: [
        { label:'The problem', h:'Students learn investing in theory.', body:["Markets stay abstract until you have to defend a real thesis on a real company in front of people who know better."] },
        { label:'The approach', h:'Do the analyst work for real.', body:["On the YIS national board I authored in-depth equity analyses and served on the outreach committee \u2014 the actual work of an analyst, certified."] },
        { label:'The outcome', h:'A seat at the table.', checklist:["Named to the <b>YIS National Board</b>.","Earned the <b>Certified Young Investment Analyst</b> designation.","Authored equity research and led outreach."] },
        { label:'What I learned', h:'Conviction needs evidence.', body:["Investing taught me to back a belief with research a stranger would trust."] },
      ], next: 'ecovision',
    },
    ecovision: {
      triad: {"build":"Designed and prototyped the olfactory module, the scent-sync hardware itself, grounded in real physics.","biz":"Raised $7,500 in grants plus five-figure revenue; Top 16 at NFTE Nationals and a Diamond Challenge Global Finalist.","lead":"Rallied a school team and earned the trust of Moffitt, Mayo & Atria to run real clinical trials."},
      process: ['cardboard rig, day one','scent cartridge v1 \u2014 it leaked','the headset was too heavy','whiteboard: timing scent to the scene','v2, on a real tester'],
      gotWrong: ['The first three scent cartridges leaked \u2014 I underestimated how hard sealing micro-volumes of liquid would be.', 'I demoed with the headset too heavy; testers got tired in minutes, so I cut the weight in half for v2.', 'I pitched the technology before talking to enough patients \u2014 the real insight came from listening, not building.'],
      faq: [{q:'Why scent, and not just visuals?', a:'Smell is the sense most tied to memory and presence. For a bedridden patient, a forest you can smell feels real in a way a 2D video never will.'}, {q:'How does the hardware actually work?', a:'A small cartridge array releases micro-doses of scent in sync with the VR scene, timed to what you are looking at.'}, {q:'What would you change?', a:'I would solve the sealing and weight problems first \u2014 the whole experience lives or dies on comfort.'}],
      reflection: 'I am still not sure we solved the hardest part \u2014 making it cheap enough to actually reach the patients who need it. That is the problem I want to keep working on.',
      title: 'Eco-Vision', verified: true, motif: null,
      heroImg: 'https://i.imgur.com/lUlvVeJ.jpeg',
      tags: ['Venture', 'MedTech', 'VR'],
      sub: 'The first olfactory-integrated VR system, letting bedridden hospital patients step outside without leaving the room.',
      facts: [['Role', 'Co-Founder'], ['Funding', '$7,500 grants'], ['Recognition', 'Top 16 · NFTE'], ['Partners', 'Moffitt · Mayo']],
      sections: [
        { label: 'The problem', h: "Patients heal slower when they're cut off from the world.", body: ["Long hospital stays do more than hurt, they <strong>isolate</strong>. Patients in extended care, especially those who are immobile or immunocompromised, lose access to the simplest restorative thing there is: being outside. Existing VR \u201cescapes\u201d tried to fix this with sight and sound alone, and they always fell flat.", "The missing sense was <strong>smell</strong>, the one most tightly wired to memory and emotion. No consumer or clinical VR system delivered it reliably."] },
        { label: 'The approach', h: 'Create the sense everyone else skipped.', body: ["We designed and prototyped an <strong>olfactory module</strong> that syncs scent to the virtual environment, pine on a forest trail, salt on a beach, matched to what the patient sees and hears. The result was the first olfactory-integrated VR experience we could validate in a clinical setting."], pull: "\u201cA beach you can smell isn't a demo, it's a patient asking to stay five more minutes.\u201d", images: ['headset prototype', 'scent module diagram'] },
        { label: 'The outcome', h: 'From a school pitch to a clinical trial.', checklist: ["<b>$7,500 in grant funding</b> secured through competitive pitches, plus <b>five figures</b> in revenue.", "<b>Top 16 at the NFTE National Pitch Competition</b> and the Conrad Innovator Award.", "<b>Diamond Challenge Global Finalist</b>, one of the world's largest high-school entrepreneurship competitions.", "Partnered with <b>Moffitt Cancer Center and Mayo Clinic</b>; ran a trial at Indiana University's Kelley School of Business.", "Developing a <b>clinical study with Atria Health</b> to measure patient outcomes."] },
        { label: 'What I learned', h: 'Conviction is a sense, too.', body: ["Eco-Vision taught me to sell a vision before it's fully created, to earn the trust of institutions far bigger than a high-school team, and to keep going when the hardware fights back. The best products solve for the human in the room, not the spec sheet."] },
      ],
      next: 'ventureseek',
    },

    ventureseek: {
      triad: {"build":"Engineered the sourcing pipeline, the thesis-matching model, and the diligence-memo generator.","biz":"Designed it around how funds actually decide, and pitched to operators and funds for feedback.","lead":"Co-founded the company and aligned a team around a product professionals would stake a decision on."},
      title: 'VentureSeek', motif: 'aigraph',
      tags: ['AI venture', 'VC tooling'],
      sub: 'An AI-powered sourcing and diligence platform that helps venture funds find, score, and research startups automatically.',
      facts: [['Role', 'Co-Founder'], ['Stack', 'LLMs + data'], ['Stage', 'Live MVP']],
      sections: [
        { label: 'The problem', h: 'Sourcing is still a manual grind.', body: ["Somewhere in a fund's inbox is the founder who could have been their best investment \u2014 and no one had the time to look. Funds screen thousands of companies a year, miss great people in the noise, and burn analyst-weeks on diligence that software should handle. The ones who lose are the founders nobody got to."] },
        { label: 'The approach', h: 'One pipeline, end to end.', body: ["VentureSeek ingests signals from across the web, <strong>scores startups against a fund's thesis</strong>, and auto-drafts diligence memos, so an analyst starts at the 80% mark instead of a blank page."], pull: "\u201cThe goal isn't to replace the analyst, it's to delete the busywork between them and the decision.\u201d" },
        { label: 'The outcome', h: 'A working deal engine.', checklist: ["Created a working MVP that <b>finds, scores, and researches</b> startups automatically.", "Designed the thesis-matching model and the diligence-memo generator.", "Pitched the platform to operators and funds for early feedback."] },
        { label: 'What I learned', h: 'Trust is the real product.', body: ["Shipping AI for professionals means every output needs a reason a partner can defend. VentureSeek taught me to pair model confidence with human judgment, and to design software people will actually stake a decision on."] },
      ],
      next: 'escaperoom',
    },

    escaperoom: {
      triad: {"build":"Worked on the engineering for a self-contained, transportable escape experience.","biz":"Own the financial model, pricing, and unit economics as CFO, every booking has to pencil out.","lead":"Built and run it with my brother, managing on-site operations and the team."},
      title: 'Mobile Escape Room', motif: 'lock',
      tags: ['Venture', 'Engineering', 'Finance', 'Design & storytelling'],
      sub: 'An experiential-entertainment startup that brings the escape room to you, created with my brother.',
      facts: [['Role', 'Engineering & CFO'], ['Built', 'Hardware + storyline'], ['Model', 'Mobile / pop-up'], ['Adds', 'Aptitude analytics']],
      sections: [
        { label: 'The problem', h: 'Escape rooms are stuck in place.', body: ["A traditional escape room carries heavy fixed costs, a lease, a permanent create-out, and it can't reach the parties, schools, and corporate events where the demand actually is."] },
        { label: 'The approach', h: 'Put the room on wheels.', body: ["My brother and I designed a self-contained, transportable escape experience and created the business around it: pricing, financial modeling, the booking flow, and on-site operations. As CFO, I own the numbers, costs, margins, and the model that has to pencil out every booking."], pull: "\u201cWe turned a fixed-location business into something that shows up at your door, and made the unit economics work.\u201d" },
        { label: 'The edge', h: 'Not just a room, a read on how you think.', checklist: ["<b>On wheels</b>, the experience comes to you: parties, schools, and corporate events.", "<b>Adaptive storytelling</b>, the storyline and narration personalize to fit each group.", "<b>Analytical insight</b>, like a Myers-Briggs for real-world problem-solving: we score aptitude and collaboration and cast each player as an <b>Operator</b>, <b>Controller</b>, or <b>Strategist</b>, told spy-style."] },
        { label: 'The engineering', h: 'Building a room that travels.', body: ["On the engineering side, I designed the puzzles and 3D models and leveraged hardware systems through Node-RED, all while making the whole experience fit inside a trailer."] },
        { label: 'The outcome', h: 'A business, not a hobby.', checklist: ["Generating <b>revenue</b> through event and private bookings.", "Created the financial model, pricing, margins, and break-even.", "Designed the operations playbook for setup, teardown, and travel."] },
        { label: 'What I learned', h: 'Where business school meets a U-Haul.', body: ["Mobile Escape Room taught me unit economics the hard way: a great experience is worthless if the logistics don't add up."] },
      ],
      next: 'decoy',
    },

    decoy: {
      triad: {"build":"Designed the deception architecture and the detection-and-alerting engine.","biz":"Framed the product and the market into a real company, decoycybersecurity.com.","lead":"Co-founded it and set the technical direction alongside a partner."},
      title: 'Decoy', motif: null,
      link: 'https://decoycybersecurity.com/',
      tags: ['AI venture', 'Cybersecurity', 'Creating'],
      sub: 'An AI, deception-based cybersecurity platform that lures, detects, and traps intruders before they reach anything real.',
      facts: [['Role', 'Co-Founder'], ['Domain', 'Security'], ['Approach', 'AI deception'], ['Stage', 'Creating']],
      sections: [
        { label: 'The problem', h: 'Defenders are always a step behind.', body: ["By the time most tools recognize an attack, the intruder is already inside, reading the records, the messages, and the data of people who trusted an organization to keep them safe. Security that only reacts to known threats is always a step behind the people it is meant to protect."] },
        { label: 'The approach', h: 'Make the network a trap.', body: ["Decoy seeds an environment with believable decoys and honeypots. The moment an attacker touches one, we know."] },
        { label: 'The outcome', h: 'From concept to product.', checklist: ["Defined the product concept and deception architecture.", "Creating the detection and alerting engine.", "Researching the AI layer that generates convincing decoys."] },
        { label: 'What I learned', h: 'Think like the attacker.', body: ["Security is a mindset before it's a product. Decoy pushed me to design for attackers, allowing myself to gain experience in mindset shifting and vulnerability detection."] },
      ],
      next: 'seeusnow',
    },

    seeusnow: {
      triad: {"build":"Built the campaigns and the advocacy structure that scaled chapters nationwide.","biz":"Helped secure millions in scholarship funding for foster youth.","lead":"Carried youth voices to Congress, the UN & WHO, and helped pass a federal law."},
      title: 'See Us Now', motif: 'network',
      heroImg: 'https://i.imgur.com/Z2eUg3r.jpeg',
      link: 'https://seeusnowusa.org/',
      linkLabel: 'Visit our website',
      gallery: ['assets/photos/sun-capitol.jpg','assets/photos/sun-team.jpg','assets/photos/sun-tampatheatre.jpg','assets/photos/sun-nasdaq.jpg'],
      tags: ['Advocacy', 'Policy'],
      sub: 'Foster-youth advocacy at national scale, turning student voices into federal policy.',
      facts: [['Role', 'Head of Global Expansion'], ['Reach', '48 states · 140+ sites'], ['Policy', 'Federal law passed'], ['Forums', 'UN · WHO']],
      sections: [
        { label: 'The approach', h: 'Put youth in the room.', body: ["As Head of Global Expansion I helped scale See Us Now's chapters, organized advocacy campaigns, and brought student voices directly to lawmakers and global bodies. We didn't ask for attention, we created campaigns that demanded it."] },
        { label: 'The outcome', h: 'Policy, not just awareness.', checklist: ["Helped pass the <b>Find &amp; Protect Foster Youth Act</b> through the U.S. Congress.", "Led a National Missing &amp; Trafficked Foster Youth Awareness Week across <b>48 states and 140+ sites</b>.", "Represented youth at the <b>UN ECOSOC Youth Forum</b> and the WHO Ministerial Conference; spoke at the IB Global Conference.", "Supported advocacy that helped secure millions in scholarship funding for foster youth."] },
        { label: 'The feature', h: 'See Us Now, on screen.', embed: 'https://www.youtube.com/embed/d3XgnZGaBqk?si=GEWC4y9f8Njcx2fL&start=883' },
        { label: 'In my words', h: 'We See You Now.', body: ["The government sees foster youth as cases. Advocacy, done right, helps us see them as who they are: people. The difference is the feeling, and the feeling comes from the story. I learned that while researching and working with foster youth at the Children's Home Network. I wanted to share the story which is why I wrote a screenplay called \u201cAfter a While, You Start to Feel Like Trash\u201d. Because a story, told right, closes the distance between people and systems.", "As a leading member of See Us Now, I've tried to close the distance between the system and the children it's supposed to serve. I helped support passage of the Find and Protect Foster Youth Act, co-organized Missing and Trafficked Foster Youth Awareness Week alongside Safe House Project and Lin-Manuel Miranda, and represented foster youth voices in DC, at the IB Global Conference, and at the UN ECOSOC Youth Forum. But none of that is what I'm most proud of. I am most proud of the students: watching a fellow advocate in their first congressional meetings, sitting with new members who were holding back, witnessing them grow, pushing them to use their voice. Which is why I want to grow SUN through an expanded chapter mentorship model. I want to offer chapters beyond our own school structured guidance on congressional outreach, storytelling, and practical bipartisan advocacy. As an HL Global Politics student, multi-term Student Council President, and congressional intern I have developed a knowledge base that will help me bridge the gap. My goal is not to hand chapters a program and walk away, it is to build up the people who will run it long after I am gone.", "Maya Angelou said people will forget what you said and what you did, but they will never forget how you made them feel. My goal is to make people feel seen, whether that is a chapter member finding their voice for the first time or a foster child out on the street. I will never fully understand what they go through. But I can refuse to look away, and I can go the distance to make sure the people around me do not either. We See You Now."] },
      ],
      next: 'internationalism',
    },

    tedx: {
      triad: {"build":"Built the event from zero, license, production, and a repeatable system.","biz":"Created a sustainable legacy program, not a one-night cost.","lead":"Assembled and coached the speaker team, then took the stage myself."},
      title: 'TEDx Carrollwood Day School', motif: null,
      heroImg: 'https://i.imgur.com/JBmeda9.jpeg',
      tags: ['Platform', 'Events & speaking'],
      sub: 'I built a TEDx event from the ground up, produced the show, and spoke on the stage I created.',
      facts: [['Role', 'Founder & Licensee'], ['Status', 'Built from scratch'], ['Hats', 'Organizer · Speaker']],
      sections: [
        { label: 'The problem', h: 'Plenty of ideas but no platform to share them.', body: ["Our school had no working TEDx stage. The hardest part of \u201cideas worth spreading\u201d turns out to be creating the stage to spread them from."] },
        { label: 'The approach', h: 'Build it from zero.', body: ["I secured the license, assembled the team, curated and coached the speakers, and produced the show end to end, then made it a <strong>legacy program</strong> so it outlasts me. This year, I'm also a speaker on it.", "That infrastructure paid off: I was reselected through a rigorous application process to curate, organize, and host the 2026 TEDx event, this time scaling up the speaker roster, deepening speaker development, building community connections, embedding legacy programming into English course requirements, and driving larger turnouts."] },
        { label: 'The outcome', h: 'A stage that runs without me.', checklist: ["Licensed and produced a full TEDx event from scratch.", "Created a sustainable, repeatable platform for student ideas.", "Curated student speakers, and took the stage as one myself."] },
        { label: 'What I learned', h: 'Leadership leaves a system behind.', body: ["I wanted TEDx to run without me, and when it did, that's how I know I created something that will make a change in the lives of those around me."] },
        { label: '', h: '', embed: 'https://www.youtube.com/embed/xeA5IF2QSoM?si=S1wAYyZEQE2RuJ5q&start=1' },
      ],
      next: 'capture',
    },

    capture: {
      triad: {"build":"The eye, composition, light, and a real point of view behind the lens.","biz":"Ran it end to end to five figures: client acquisition, pricing, and delivery.","lead":"Told people's stories well enough to earn a Congressional Art Award and a magazine cover."},
      title: 'Capture the Moment', motif: 'aperture',
      heroImg: 'assets/photos/p10.jpg',
      carousel: true,
      captions: ['','','','','','','','','','Lifeguard tower at dusk, my Scholastic submission.'],
      gallery: ['assets/photos/p1.jpg','assets/photos/p2.jpg','assets/photos/p3.jpg','assets/photos/p4.jpg','assets/photos/p5.jpg','assets/photos/p6.jpg','assets/photos/p7.jpg','assets/photos/p8.jpg','assets/photos/p9.jpg','assets/photos/p10.jpg'],
      tags: ['Art', 'Photography', 'Business'],
      sub: 'A for-profit photography business, and an award-winning eye behind it.',
      facts: [['Role', 'Founder'], ['Revenue', '5 figures'], ['Honor', 'Congressional Art Award'], ['Press', 'Tampa Bay Mag cover']],
      sections: [
        { label: 'The eye', h: 'Some things are worth remembering.', body: ["I founded Capture the Moment to tell people's stories, games, dates, trips, milestones."] },
        { label: 'The business', h: 'Run like a company, shot like an artist.', body: ["I handled it end to end: client acquisition, pricing, marketing, and delivery."] },
        { label: 'The outcome', h: 'Recognized work.', checklist: ["Won the <b>Congressional Art Award</b> for a photographic piece.", "Featured on the <b>cover of Tampa Bay Magazine</b>.", "Work featured in the <b>Florida Museum of Photographic Arts</b> and <b>Tampa International Airport</b>."] },
        { label: 'What I learned', h: 'Sell the feeling, not the service.', body: ["people pay for how the work makes them feel."] },
      ],
      next: 'smif',
    },

    smif: {
      triad: {"build":"Created the research engine and the analyst pipeline that powers the fund.","biz":"Designed an ethically-screened fund that manages real capital under real risk.","lead":"Founded it and built the governance that keeps a student team honest."},
      title: 'Student-Led Investing Firms', motif: 'candles',
      tags: ['Finance', 'Founder'],
      sub: 'Two student-run investing firms, Patriot Portfolio and Fundra, managing real capital under real research and governance.',
      facts: [['Role', 'Founder'], ['Firms', 'Patriot Portfolio · Fundra'], ['Focus', 'Ethical investing'], ['Stage', 'Active']],
      sections: [
        { label: 'The problem', h: 'Students learn finance from textbooks, not portfolios.', body: ["Most high-schoolers never touch real capital, real risk, or real research. Finance stays abstract until someone hands you a portfolio and says \u201cnow decide.\u201d"] },
        { label: 'Patriot Portfolio', h: 'A fund inside the school.', body: ["I founded <b>Patriot Portfolio</b> at CDS, building the <strong>governance, the research process, and the analyst pipeline</strong> so students manage a real, ethically-screened portfolio and learn allocation, valuation, and judgment under actual stakes."] },
        { label: 'Fundra', h: 'Investing beyond one campus.', body: ["<b>Fundra</b> extends the model outward, a student-led investing firm built to bring the same hands-on research, analyst training, and disciplined decision-making to students beyond a single school."] },
        { label: 'The outcome', h: 'Infrastructure first.', checklist: ["Founded two student-led investing firms: <b>Patriot Portfolio</b> and <b>Fundra</b>.", "Designed governance and a research / analyst process for both.", "Managing real capital with ethical screening, piloting toward wider expansion."] },
        { label: 'What I learned', h: "The math isn't the hard part.", body: ["Building these firms taught me that the discipline and structure that keep a team honest matter more than any single stock pick."] },
      ],
      next: 'ei',
    },

    ei: {
      title: 'CDS Entrepreneurial Institute', motif: null, heroImg: 'assets/photos/ei-hero.png',
      tags: ['Entrepreneurship', 'Founder'],
      sub: 'A school-wide institute training principled entrepreneurial thinkers through competitions, incubators, internships, and real ventures.',
      facts: [['Role', 'Builder'], ['Org', 'CDS'], ['Focus', 'Entrepreneurship'], ['Spans', 'Ventures · curriculum · media']],
      sections: [
        { label: 'The mission', h: 'Principled entrepreneurial thinkers.', body: ["The CDS Entrepreneurship Institute trains principled entrepreneurial thinkers through competitions, incubators, internships, and real ventures."] },
        { label: 'What I built', h: 'From the hub out.', checklist: ["Built the central hub page.", "Developed the Entrepreneurial Certificate curriculum and completion strategy.", "Built <b>Patriot Portfolio</b>, a student-managed investment fund.", "Deployed a digital platform for <b>Patriot Pathways</b> to make opportunity and internship seeking / tracking easier for CDS students.", "Founded the <b>24-Hour Project</b>.", "Founded the <b>International SDG Buildathon</b>.", "Developed the UGC pipeline and <b>Forge</b> content / podcast series.", "Redesigned the antiquated Design Space into a high-tech, ambient, YC-inspired Innovation Lab."] },
      ],
      next: 'stage',
    },

    stage: {
      triad: {"build":"Worked tech and backstage craft, not just center stage.","biz":"A production runs like an operation, deadlines, roles, and a show that has to ship on opening night.","lead":"VP then President of the troupe, supporting the ensemble, not just a part."},
      title: 'On Stage', motif: 'star',
      heroImg: 'https://i.imgur.com/5tIZC8P.jpeg',
      gallery: ['assets/photos/stage-2.jpg'],
      tags: ['Art', 'Theater'],
      sub: '22 productions, a string of roles, and a Thespian troupe I help lead.',
      facts: [['Role', 'Thespian President'], ['Productions', '22+'], ['Awards', '6× Superior'], ['Honor', 'Broadway Stars of the Future']],
      sections: [
        { label: 'Why theater', h: 'Where humans are most human.', body: ["Theater is a powerful art with the ability to inspire and evoke a range of emotions in people. One of humans' most powerful expressions is the candid display of emotion. It can motivate us to pursue our dreams, appreciate the beauty around us, bring people together, and help others find hope in difficult times, or invite us to affect change in the world by highlighting struggle. Theater creates community, vulnerability, emotion, and meaning in both the audience and the performer."] },
        { label: 'Theater beyond the stage', h: 'Service through performance.', checklist: ["Performed on <b>service trips to nursing homes and hospitals</b>, bringing theater to people who couldn't come to it.", "<b>Penguin Project</b> peer mentor, supporting performers with disabilities in inclusive theater."] },
        { label: 'The roles', h: 'Twenty-seven shows and counting.', checklist: ["Chicago, Billy Flynn", "Mamma Mia, Sam Carmichael", "Hadestown, Hermes", "Les Misérables, Jean Valjean", "High School Musical, Troy", "Annie, Daddy Warbucks", "Grunch, The Grunch", "Wizard of Oz, Tin Man", "Mean Girls, Aaron Samuels", "Pippin, King Charles", "Clue, Mr. Boddy", "Rumors, Lenny", "Matilda Jr., Mr. Wormwood", "Charlie Brown, Schroeder", "Frozen, Hans", "Zoodate, Praying Mantis, Bull, Beaver", "Seussical, Mr. Mayor", "Curtains, Randy Dexter", "Shrek, Papa Bear", "Fiddler on the Roof, Fyedka", "101 Dalmatians, Horace", "Grunch, Allen", "Brothers Grimm, Ensemble", "Bye Bye Birdie, Stage Manager", "The Play That Goes Wrong, Backstage Technician", "Terezin Promise, Lighting Technician", "24 Hr Project, Director"] },
        { label: 'Recognition', h: 'On the festival circuit.', checklist: ["Roles across <b>27 productions</b>.", "<b>Six Superior awards</b> at the Florida District 6 Thespian Festival.", "<b>Broadway Stars of the Future</b> recognition for a leading musical performance.", "VP then President of Troupe 7235; mentor to junior thespians."] },
        { label: 'The 24-Hour Project', h: 'Cold read to curtain in one day.', body: ["We created the <b>24-Hour Project</b>: students take a secret musical or play from a cold read to a full public performance in a single 24-hour lock-in, then perform it for the whole school. It strips away months of rehearsal so students lead under real pressure: fast decisions, rapid problem-solving, and total collaboration. It brings non-theater students into the art, builds cross-discipline respect between actors and tech, and positions CDS as an innovator in arts education. We do it because it's not easy."] },
      ],
      next: 'ecovision',
    },

    internationalism: {
      triad: {"build":"Created the Round Square conference messaging app and the Buildathon.","biz":"Designed programs built to scale across 260+ schools.","lead":"Baraza leader facilitating dialogue among students from seven countries."},
      title: 'Internationalism', motif: 'globe', heroImg: 'assets/photos/internationalism-hero.jpg', heroPos: 'center 40%',
      tags: ['Global', 'Round Square'],
      sub: 'Cross-cultural leadership through Round Square, leading delegates, creating the tools and the programs, and connecting students across borders.',
      facts: [['Role', 'Baraza Leader'], ['Network', '260+ schools · 50 countries'], ['Created', 'Conf. app · Buildathon'], ['Delegate', 'RS Spain']],
      sections: [
        { label: 'Why internationalism', h: 'Travel is the key to open-mindedness.', body: ["I've been lucky to see a lot of the world, Austria, India, the UK, Germany, Poland, France, Costa Rica and more, and Round Square turned that instinct into leadership. RS is a network of <strong>260+ schools across 50 countries</strong> created around six shared IDEALS, and I've spent three years helping students actually connect across them."] },
        { label: 'Baraza Leader', h: 'Leading the room.', body: ["As a <strong>Baraza</strong> (discussion-group) leader, I facilitated cross-cultural dialogue among students from seven countries and helped plan and run the inaugural CDS Round Square conference end to end."] },
        { label: 'What I created', h: 'When the logistics broke, I created the fix.', checklist: ["Created the <b>RS Conference Messaging Application</b> to coordinate delegates, schedules, and cross-school communication.", "Founded the <b>RS Buildathon</b>, students from different schools collaborate to solve real international problems.", "<b>Year-3 goal:</b> integrate the Buildathon directly into our onsite conference."], pull: "\u201cThe IDEALS are the point, but you need the tools and the programs to make a global network actually talk.\u201d" },
        { label: 'On the world stage', h: 'From Spain to History Labs.', checklist: ["Selected delegate to the <b>Round Square International Conference in Spain</b>.", "Participated in <b>History Labs</b> with schools across the globe.", "Conference planner for our school conference."] },
        { label: 'What I learned', h: 'Perspective is a skill.', body: ["Internationalism taught me to lead people who don't share my context, to listen first, find common ground, and better the world by supporting very different students as they solve problems together."] },
      ],
      next: 'tedx',
    },

    nextgen: {
      triad: {"build":"Created a curriculum around executive-function skills, not just test prep.","biz":"Owned recruiting, scheduling, and pricing, and grew it to 50+ clients.","lead":"Built and managed a team of student tutors."},
      title: 'Next-Gen Learning', motif: null,
      tags: ['EdTech', 'Founder'],
      sub: 'A student-run tutoring firm that teaches executive function, not just content.',
      facts: [['Role', 'Founder'], ['Clients', '50+'], ['Team', 'Student tutors'], ['Focus', 'Life skills']],
      sections: [
        { label: 'About Next Gen', h: 'Cultivating great thinkers.', body: ["Welcome to Next Gen Tutoring, a tutoring service that seeks to cultivate all students into the world's greatest thinkers while also ensuring their success in school. We provide test preparation (for both summative assessments and standardized exams), homework assistance, personalized lessons, and guided practice. Our approach is inclusive: we work with students of all skill levels and across any subject they choose."] },
        { label: 'Beyond academics', h: 'The skills that last.', body: ["We don't stop at academics. At Next Gen Tutoring, we focus on fostering essential life skills such as time management, organization, critical thinking, and communication, the skills we believe are the foundation for long-term success. Our tutors are students themselves, passionate about helping others grow. We aim to guide our peers to surpass us, sharing the lessons we've learned so they can avoid the mistakes we made."] },
        { label: 'The idea', h: 'Teach the skills school forgets.', body: ["Next-Gen pairs students with tutors who teach time management, organization, and critical thinking alongside the material, the executive-function skills that actually compound."] },
        { label: 'The outcome', h: 'Created and scaled.', checklist: ["Grew to <b>50+ clients</b> and a team of student tutors.", "Worked on recruiting, scheduling, pricing, and operations.", "Created a curriculum around life skills, not just test prep."] },
      ], next: 'sbs',
    },
    sbs: {
      triad: {"build":"Designed the operational workflows and the programming behind the platform.","biz":"Scaled membership from 50 to 400+ across the U.S.","lead":"Led a team of 20 and built repeatable programs that don't depend on me."},
      title: 'Start Business Smart', motif: null,
      tags: ['Platform', 'Head of Strategy & Ops'],
      sub: 'A platform connecting high-achieving students with founders, operators, and real business experience.',
      facts: [['Role', 'Head of Strategy'], ['Growth', '50 → 400+'], ['Reach', 'Nationwide'], ['Programs', '5+']],
      sections: [
        { label: 'The mission', h: 'Give students real reps.', body: ["We're building a platform that brings driven high-school students into real conversations with founders, operators, and professionals earlier than most ever get access. The goal is exposure, perspective, and real insight before students are forced to make career-defining decisions."] },
        { label: 'What my team does', h: 'Five focus areas.', checklist: ["Internships and Youth Advisory Councils.", "Software development (back-end support).", "Consulting teams.", "Economy and investment research.", "Live student investment funds."] },
        { label: 'The outcome', h: 'From 50 to 400+.', checklist: ["Scaled membership <b>from 50 to 400+</b> across the U.S.", "Designed operational workflows and partnership outreach.", "Created programming: consulting, internships, speaker series, competitions."] },
      ], next: 'ebit',
    },
    ebit: {
      triad: {"build":"Built the council structure plus the incubator and speaker programming.","biz":"Delivered real consulting to CharityBuzz, Magnolia Pictures & the Schwarzenegger Institute.","lead":"Founded the program as COO and ran communications, social, and the student teams."},
      title: 'EBIT Youth Advisory Councils', motif: null, heroImg: 'assets/logos/ebit-logo.png', heroPos: 'center', link: 'https://ebitclub.com/',
      tags: ['Consulting', 'Founder'],
      sub: 'Founded and helped run student advisory councils delivering real consulting to real companies.',
      facts: [['Role', 'YAC Founder · COO · Operations'], ['Councils', '5'], ['Clients', 'CharityBuzz +'], ['Org', 'EBIT']],
      sections: [
        { label: 'About EBIT', h: 'Business, built for students.', body: ["EBIT (Entrepreneurship Business Investment Team) is a free high-school program where students explore business, entrepreneurship, finance, and technology. Founded in 2020, it has become a go-to resource for students who want a deeper understanding of these fields and the skills to succeed in their careers."] },
        { label: 'The idea', h: 'Put students in the room.', body: ["I founded EBIT's Youth Advisory Council program, student teams that deliver insight and project-based solutions to companies, giving members hands-on corporate experience."] },
        { label: 'How it works', h: 'Hands-on and personal.', body: ["We offer interactive group lab sessions and individual presentations, giving members the chance to get hands-on experience and ask questions of our speakers in a more intimate setting. That personal connection is an essential part of the learning process, and we work to create a welcoming, supportive environment for every member."] },
      ], next: 'studentcouncil',
    },
    studentcouncil: {
      triad: {"build":"Built the school's Entrepreneurial Institute, a digital career center, and an AI-in-administration program.","biz":"Raised $29K+ and drove a student equity fund.","lead":"Three-time class president and Student Body President leading school-wide governance and culture."},
      title: 'Student Council', motif: null, heroImg: 'assets/photos/studentcouncil-cover.jpg', heroPos: 'center 35%',
      tags: ['Leadership', '3× Class Pres · Student Body Pres'],
      sub: 'Three years leading the student body, governance, fundraising, and culture.',
      facts: [['Role', '3× Class Pres'], ['Then', 'Student Body Pres'], ['Raised', '$29K+'], ['Created', 'Policy & culture']],
      sections: [
        { label: 'The role', h: 'Lead the whole school.', body: ["As three-time class president and Student Body President I led school-wide governance and engagement, and raised <strong>$29,000+</strong> for cancer patients and foster youth."] },
        { label: 'What I created', h: 'Culture and policy.', checklist: ["Built the school's <b>Entrepreneurial Institute</b> from the ground up.", "Founded <b>The Spice Seat</b> student interview series.", "Drove policy on murals, advisory curriculum, and a student equity fund.", "Created a digital career center and an AI-in-administration program."] },
        { label: 'Student Body Advocacy', h: 'From event planning to real governance.', body: ["I built the <b>Student Body Advocacy Program</b>, reframing student council from an event-planning body into a real governing institution. Students can finally take an idea or concern and see it actually heard, worked on, and resolved, with results reported transparently up to administration and the board, and back out to the student body. It gives every student a trusted path from idea to impact."] },
        { label: 'Tampa Bay Regional Student Council', h: 'Connecting leaders across the bay.', body: ["I founded the <b>Tampa Bay Regional Student Council</b>, a network uniting student leaders from schools across the region to trade ideas, develop leaders, and mobilize shared community impact, including a region-wide Student Impact Week of service. It turns isolated councils into one collaborative movement."] },
        { label: 'What I learned', h: 'Lead by listening.', body: ["Real authority comes from representing people well, you lead by listening first, then acting."] },
      ], next: 'spiceseat',
    },
    spiceseat: {
      title: 'The Spice Seat', motif: 'aperture',
      tags: ['Media', 'Founder & host'],
      sub: 'A student interview series, hot wings, real conversations.',
      facts: [['Role', 'Founder & host'], ['Format', 'Interview series'], ['Subjects', 'Students & faculty'], ['Vibe', 'Unfiltered']],
      sections: [
        { label: 'The idea', h: 'Spotlight the people behind the school.', body: ["I launched The Spice Seat, a hot-wing-fueled interview series spotlighting students, faculty, and culture, creating community through honest conversation."] },
        { label: 'The outcome', h: 'A platform with personality.', checklist: ["Founded, host, and produce the series.", "Revitalized student media and engagement.", "Created a recurring format people actually tune in for."] },
        { label: 'What I learned', h: 'Story creates community.', body: ["People open up when the format is fun, and a school's culture is really just its stories, told well."] },
      ], next: 'rewired',
    },
    rewired: {
      title: 'Re-Wired for Wealth', motif: 'candles',
      tags: ['Editing', 'Editor'],
      sub: 'Editor of a published book on the psychology of money for teens.',
      facts: [['Role', 'Editor'], ['Topic', 'Financial literacy'], ['Audience', 'Teens'], ['Status', 'Published']],
      sections: [
        { label: 'The work', h: 'Make money make sense.', body: ["I edited <em>Re-Wired for Wealth</em>, a book on financial-attachment styles and money psychology written to make personal finance click for teenagers."] },
        { label: 'The outcome', h: 'In print.', checklist: ["Edited the manuscript end to end for clarity and voice.", "Shaped it for a teen audience.", "Published and in readers' hands."] },
        { label: 'What I learned', h: 'Editing is empathy.', body: ["Get out of the author's way while sharpening the message, serve the reader above the sentence."] },
      ], next: 'ryannece',
    },
    ryannece: {
      title: 'Ryan Nece Foundation', motif: null, heroImg: 'assets/photos/ryannece-cover.jpg', heroPos: 'center 28%',
      tags: ['Service', 'Leadership'],
      sub: 'A two-year Student Service Program built on the Power of Giving.',
      facts: [['Program', 'Student Service'], ['Length', '2-year journey'], ['Theme', 'Power of Giving'], ['Region', 'Greater Tampa Bay']],
      sections: [
        { label: 'The program', h: 'The Power of Giving.', body: ["The Power of Giving is about helping every man, woman, and child realize their potential to better the world in which they live, work, and play. By sharing of time, treasures, or talents, every person has the opportunity to make a positive impact on the world. The Power of Giving Student Service Program is a direct reflection of that mission, creating opportunities for teens to embrace the Power of Giving through volunteerism and inspirational leadership programs."] },
        { label: 'The journey', h: 'Shaping servant leaders.', body: ["The goal of the Student Service Program is to help shape and mentor the next generation of servant leaders. Through its leadership curriculum and service projects, it aims to ignite a spark in students so they experience a renewed sense of purpose that reflects in the service work they continue throughout Tampa Bay and beyond. Selected students embark on a two-year journey with the foundation, growing through their junior and senior years."] },
        { label: 'What the Power of Giving means to me', h: 'A rock in a pond.', body: ["To me, the \u201cPower of Giving\u201d is one of the world's greatest phenomena. Imagine a heavy rock thrown into a pond. The heavy rock represents an act of kindness, selflessness, generosity, or compassion. It may be difficult to wield it, but it holds immense power. It is what you give to the world. Then imagine the ripples created by this rock, this is the domino effect that proceeds an act of giving. Notice how the rock creates a splash that ripples outwards. It represents the chain reaction of kindness that impacts each member of your community. One act of kindness and giving inspires another, and another, and another. The power of giving is derived from the community's willingness to give when inspired by a simple act.", "I have witnessed the transformative power of giving through my work with foster youth. Many children in the foster care system lack stable support networks. However, when they are exposed to a simple act of kindness, a smile, a hug, or a few kind words, it can change their day. Giving does not have to be gestures of great grandeur, sometimes the smallest acts are the most meaningful. A single act of kindness can inspire others to take action, building a culture of service that strengthens entire communities. Ultimately, the power of giving lies in its ability to connect us, heal wounds, and brighten lives. It reminds us that even the smallest actions can leave a lasting impact."] },
        { label: 'In a phrase', h: 'Giving feels like living.', body: ["Giving feels like living."] },
      ], next: 'ecovision',
    },
  };

  function esc(s) { return s; }
  function checkIcon() { return `<span class="c"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="m20 6-11 11-5-5"/></svg></span>`; }

  function triadHTML(c){ if(!c.triad) return ''; return '<section class="cs-sec"><p class="label reveal">How it drew on all three</p><h2 class="reveal" style="margin-bottom:22px">Build \u00b7 Business \u00b7 Lead.</h2><div class="triad"><div class="tri-card tri-b reveal"><div class="tri-h">Engineering</div><p>'+c.triad.build+'</p></div><div class="tri-card tri-m reveal"><div class="tri-h">Business</div><p>'+c.triad.biz+'</p></div><div class="tri-card tri-g reveal"><div class="tri-h">Leadership</div><p>'+c.triad.lead+'</p></div></div></section>'; }

  function render() {
    const id = new URLSearchParams(location.search).get('p') || 'ecovision';
    const c = CASES[id] || CASES.ecovision;
    var nextId = c.next; if (nextId === id) { var ks = Object.keys(CASES).filter(function(k){return k!==id;}); nextId = ks[(ks.indexOf(c.next)+1+ks.length)%ks.length] || ks[0]; }
    document.title = c.title + ', Case Study · Nishant Shah';
    if (c.carousel) {
      document.querySelector('.cs-hero').style.display = 'none';
      const caps = c.captions || [];
      let slides='';
      var texts=[{tag:c.tags[0],h:c.title,p:c.sub}].concat(c.sections.map(function(sec){return {tag:sec.label,h:sec.h,p:(sec.body?sec.body.join(' '):'')+(sec.checklist?' '+sec.checklist.join(' '):'')};}));
      c.gallery.forEach(function(src,i){ var t=texts[i]; var ov=t?('<figcaption class="pcard"><div class="ctag">'+t.tag+'</div><h3>'+t.h+'</h3><p>'+t.p+'</p></figcaption>'):(caps[i]?('<figcaption class="pcap">'+caps[i]+'</figcaption>'):''); slides+='<figure class="pslide pphoto"><img src="'+src+'" loading="lazy" alt="Photograph">'+ov+'</figure>'; });
      document.getElementById('cs-sections').innerHTML = '<div class="pcar" id="pcar">'+slides+'</div><div class="pcar-hint">drag / scroll horizontally \u2192</div>';
      var pc = document.getElementById('pcar');
      pc.addEventListener('wheel', function(ev){ if(Math.abs(ev.deltaY)>Math.abs(ev.deltaX)){ pc.scrollLeft += ev.deltaY; ev.preventDefault(); } }, {passive:false});
      function flow(){ var mid=pc.scrollLeft+pc.clientWidth/2; [].forEach.call(pc.children, function(sl){ var cc=sl.offsetLeft+sl.offsetWidth/2, d=(cc-mid)/pc.clientWidth, rot=Math.max(-28,Math.min(28,-d*55)), sc=Math.max(0.8,1-Math.abs(d)*0.24); sl.style.transform='rotateY('+rot+'deg) scale('+sc+')'; sl.style.zIndex=String(100-Math.round(Math.abs(d)*100)); sl.style.opacity=Math.max(0.3,1-Math.abs(d)*0.72).toFixed(2); }); }
      pc.addEventListener('scroll', flow, {passive:true}); window.addEventListener('resize', flow); setTimeout(flow,60); setTimeout(flow,500);
      var nxc=CASES[nextId], ne=document.getElementById('cs-next'); ne.innerHTML='<div><div class="k">Next project</div><h3>'+nxc.title+'</h3>'+'</div><span class="arrow">\u2192</span>'; ne.setAttribute('href','case-study.html?p='+nextId);
      return;
    }

    document.getElementById('cs-tagrow').innerHTML = c.tags.map((t, i) =>
      `<span class="pill${i === 0 ? ' pill-accent' : ''}">${t}</span>`).join('');

    const v = c.verified ? ` <span class="verified"><svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor" style="vertical-align:-2px"><path d="M12 2l2.4 1.8 3-.2 1 2.8 2.6 1.5-.8 2.9.8 2.9-2.6 1.5-1 2.8-3-.2L12 22l-2.4-1.9-3 .2-1-2.8L3 16.2l.8-2.9L3 10.4l2.6-1.5 1-2.8 3 .2z"/><path d="M8.5 12.5l2.5 2.5 4.5-5" stroke="#fff" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg></span>` : '';
    document.getElementById('cs-title').innerHTML = c.title + v;
    document.getElementById('cs-sub').textContent = c.sub;
    (function(){ var bc='<nav class="cs-bread reveal"><a href="portfolio.html">Home</a><span>\u203a</span><a href="portfolio.html">Ventures</a><span>\u203a</span><span class="cur">'+c.title+'</span></nav>'; document.getElementById('cs-tagrow').insertAdjacentHTML('beforebegin',bc); var words=0; (c.sections||[]).forEach(function(s){ if(s.body) s.body.forEach(function(p){ words+=String(p).split(/\s+/).length; }); }); var mins=Math.max(1,Math.round(words/200)); document.getElementById('cs-sub').insertAdjacentHTML('afterend','<div class="cs-readtime reveal">'+mins+' min read</div>'); })();
    document.getElementById('cs-factbar').innerHTML = c.facts.map(([k, val]) =>
      `<div><div class="k">${k}</div><div class="v">${val}</div></div>`).join('');
    if (c.link) document.getElementById('cs-sub').insertAdjacentHTML('afterend',
      `<a class="btn btn-secondary reveal" style="margin-top:22px" href="${c.link}" target="_blank" rel="noopener">${c.linkLabel||'Visit live site'} <span class="arrow">\u2192</span></a>` +
      (c.link2 ? `<a class="btn btn-secondary reveal" style="margin-top:22px;margin-left:10px" href="${c.link2}" target="_blank" rel="noopener">${c.link2Label||'Visit live site'} <span class="arrow">\u2192</span></a>` : ''));

    const art = document.getElementById('cs-heroart');
    if (c.heroImg) {
      art.style.padding = '0';
      art.style.overflow = 'hidden';
      art.style.position = 'relative';
      art.innerHTML = `<img src="${c.heroImg}" alt="${c.title}" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:${c.heroPos||'center'};" />`;
    } else if (c.motif && motifs[c.motif]) {
      art.innerHTML = motifs[c.motif];
    } else {
      art.style.display = 'none';
    }

    let secHtml = c.sections.map((s, i) => {
      const last = i === c.sections.length - 1;
      let inner = '';
      if (s.label) inner += `<p class="label reveal">${s.label}</p>`;
      if (s.h) inner += `<h2 class="reveal">${s.h}</h2>`;
      if (s.body) inner += s.body.map(p => `<p class="reveal">${p}</p>`).join('');
      if (s.pull) inner += `<div class="pull reveal">${s.pull}</div>`;
      if (s.images) inner += `<div class="imgrow">` + s.images.map((cap, j) =>
        `<div class="ph reveal"${j ? ' style="transition-delay:.08s"' : ''}><span>${cap}</span></div>`).join('') + `</div>`;
      if (s.checklist) inner += `<ul class="checklist">` + s.checklist.map(li =>
        `<li class="reveal">${checkIcon()}<span>${li}</span></li>`).join('') + `</ul>`;
      if (s.embed) inner += `<div class="cs-embed reveal" style="position:relative;width:100%;aspect-ratio:16/9;margin-top:18px;border-radius:14px;overflow:hidden;"><iframe src="${s.embed}" title="Video" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen style="position:absolute;inset:0;width:100%;height:100%;"></iframe></div>`;
      return `<section class="cs-sec"${last ? ' style="border-bottom:0;"' : ''}>${inner}</section>`;
    }).join('');
    if (c.gallery) secHtml += '<section class="cs-sec"><h2 class="reveal" style="margin-bottom:24px">A few favorites.</h2><div class="cs-gallery">' + c.gallery.map(function(src,i){ return '<a class="gItem reveal" href="'+src+'" target="_blank" rel="noopener" style="transition-delay:'+((i%4)*0.05)+'s"><img src="'+src+'" loading="lazy" alt="Photograph by Nishant Shah"></a>'; }).join('') + '</div></section>';
    if (false && c.triad) secHtml += triadHTML(c);
    if (c.process) secHtml += '<section class="cs-sec"><p class="label reveal">The messy middle</p><h2 class="reveal" style="margin-bottom:20px">Process, not polish.</h2><div class="procstrip">'+c.process.map(function(p){return '<div class="procitem reveal"><span>'+p+'</span></div>';}).join('')+'</div></section>';
    if (c.gotWrong) secHtml += '<section class="cs-sec"><p class="label reveal">The hard parts</p><h2 class="reveal">What I got wrong.</h2><ul class="failog">'+c.gotWrong.map(function(x){return '<li class="reveal">'+x+'</li>';}).join('')+'</ul></section>';
    if (c.faq) secHtml += '<section class="cs-sec"><p class="label reveal">Deeper dive</p><h2 class="reveal" style="margin-bottom:20px">If you want to know more.</h2><div class="faq">'+c.faq.map(function(f){return '<details class="reveal"><summary>'+f.q+'</summary><p>'+f.a+'</p></details>';}).join('')+'</div></section>';
    if (c.reflection) secHtml += '<section class="cs-sec" style="border-bottom:0"><div class="reflectcard reveal"><span class="rl">Looking back</span><p>'+c.reflection+'</p></div></section>';
    document.getElementById('cs-sections').innerHTML = secHtml;

    const nx = CASES[nextId];
    document.getElementById('cs-next').innerHTML =
      `<div><div class="k">Next project</div><h3>${nx.title}</h3></div><span class="arrow">→</span>`;
    document.getElementById('cs-next').setAttribute('href', 'case-study.html?p=' + nextId);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', render);
  else render();
})();
