const mockReviews = {
  '1': [
    {
      id: 'r1',
      reviewer_name: 'Ashley K.',
      reviewer_avatar: 'https://i.pravatar.cc/40?img=20',
      rating: 5,
      date: '2026-02-14',
      session_type: 'Group Session',
      text: 'Jordan completely transformed how I shop. Found 6 incredible pieces in 90 mins at Goodwill Valencia, including a cropped denim jacket and vintage Levi\'s. My whole crew is obsessed.'
    },
    {
      id: 'r2',
      reviewer_name: 'Mina T.',
      reviewer_avatar: 'https://i.pravatar.cc/40?img=45',
      rating: 4,
      date: '2025-12-02',
      session_type: 'Solo Session',
      text: 'We hit Community Thrift and she built me a full office-to-dinner capsule in one loop around Mission District.'
    },
    {
      id: 'r3',
      reviewer_name: 'Dana P.',
      reviewer_avatar: 'https://i.pravatar.cc/40?img=12',
      rating: 5,
      date: '2025-10-27',
      session_type: 'Group Session',
      text: 'She clocked everyone\'s vibe instantly and kept us focused. Best find was a red leather moto at Thrift Town.'
    }
  ],
  '2': [
    {
      id: 'r4',
      reviewer_name: 'Nora S.',
      reviewer_avatar: 'https://i.pravatar.cc/40?img=33',
      rating: 5,
      date: '2026-03-01',
      session_type: 'Solo Session',
      text: 'Cam took me through Williamsburg and found a wool coat at Buffalo Exchange plus perfect boots from Crossroads.'
    },
    {
      id: 'r5',
      reviewer_name: 'Elena M.',
      reviewer_avatar: 'https://i.pravatar.cc/40?img=39',
      rating: 4,
      date: '2026-01-16',
      session_type: 'Group Session',
      text: 'Loved the pacing and store picks. We covered Wasteland and two small vintage shops off Bedford.'
    },
    {
      id: 'r6',
      reviewer_name: 'Priya D.',
      reviewer_avatar: 'https://i.pravatar.cc/40?img=48',
      rating: 5,
      date: '2025-11-05',
      session_type: 'Solo Session',
      text: 'Came in with nothing, left with a full weekend wardrobe and a killer plaid blazer.'
    }
  ],
  '3': [
    {
      id: 'r7',
      reviewer_name: 'Kelsey B.',
      reviewer_avatar: 'https://i.pravatar.cc/40?img=54',
      rating: 5,
      date: '2026-02-22',
      session_type: 'Group Session',
      text: 'Rio mapped Fairfax perfectly. We pulled layered streetwear looks at Urban Outfitters and finished with statement sneakers.'
    },
    {
      id: 'r8',
      reviewer_name: 'Julia C.',
      reviewer_avatar: 'https://i.pravatar.cc/40?img=59',
      rating: 4,
      date: '2025-12-10',
      session_type: 'Solo Session',
      text: 'Great energy and super practical styling. Learned how to mix oversized tops with cleaner pants.'
    },
    {
      id: 'r9',
      reviewer_name: 'Tara W.',
      reviewer_avatar: 'https://i.pravatar.cc/40?img=62',
      rating: 5,
      date: '2025-10-19',
      session_type: 'Group Session',
      text: 'She helped all three of us find pieces that looked coordinated but not matchy. Exactly what we wanted.'
    }
  ],
  '4': [
    {
      id: 'r10',
      reviewer_name: 'Bri L.',
      reviewer_avatar: 'https://i.pravatar.cc/40?img=68',
      rating: 5,
      date: '2026-03-12',
      session_type: 'Solo Session',
      text: 'Naomi nailed smart casual in Logan Square. We grabbed clean basics at Zara and a tailored jacket that fits like custom.'
    },
    {
      id: 'r11',
      reviewer_name: 'Sofia N.',
      reviewer_avatar: 'https://i.pravatar.cc/40?img=15',
      rating: 4,
      date: '2026-01-08',
      session_type: 'Group Session',
      text: 'Helpful and detailed. She gave each of us a shopping map so we could keep building outfits after the session.'
    },
    {
      id: 'r12',
      reviewer_name: 'Erin Q.',
      reviewer_avatar: 'https://i.pravatar.cc/40?img=3',
      rating: 5,
      date: '2025-09-30',
      session_type: 'Solo Session',
      text: 'Best part was how she explained proportions. I now know exactly what cuts work for me.'
    }
  ],
  '5': [
    {
      id: 'r13',
      reviewer_name: 'Maya R.',
      reviewer_avatar: 'https://i.pravatar.cc/40?img=7',
      rating: 5,
      date: '2026-02-05',
      session_type: 'Group Session',
      text: 'Devon made South Congress feel easy. We found vintage denim at Buffalo Exchange and a great suede bag near East Austin.'
    },
    {
      id: 'r14',
      reviewer_name: 'Claire H.',
      reviewer_avatar: 'https://i.pravatar.cc/40?img=28',
      rating: 4,
      date: '2025-12-28',
      session_type: 'Solo Session',
      text: 'Super collaborative. I appreciated that he asked lifestyle questions before we started pulling pieces.'
    },
    {
      id: 'r15',
      reviewer_name: 'Ivy F.',
      reviewer_avatar: 'https://i.pravatar.cc/40?img=24',
      rating: 5,
      date: '2025-10-11',
      session_type: 'Group Session',
      text: 'He found us coordinated concert looks in one afternoon. Great eye for texture and color.'
    }
  ],
  '6': [
    {
      id: 'r16',
      reviewer_name: 'Rhea J.',
      reviewer_avatar: 'https://i.pravatar.cc/40?img=42',
      rating: 5,
      date: '2026-03-18',
      session_type: 'Solo Session',
      text: 'Lena mapped Lower East Side vintage shops like a pro. Picked up a perfect trench and two silk tops in one pass.'
    },
    {
      id: 'r17',
      reviewer_name: 'Monica A.',
      reviewer_avatar: 'https://i.pravatar.cc/40?img=56',
      rating: 4,
      date: '2026-01-21',
      session_type: 'Group Session',
      text: 'She kept us on budget while still making everything look elevated. We loved her store sequencing.'
    },
    {
      id: 'r18',
      reviewer_name: 'Tina G.',
      reviewer_avatar: 'https://i.pravatar.cc/40?img=11',
      rating: 5,
      date: '2025-11-14',
      session_type: 'Solo Session',
      text: 'Quick, specific, and zero fluff. I finally have an outfit formula that works for every workday.'
    }
  ]
};

export default mockReviews;
