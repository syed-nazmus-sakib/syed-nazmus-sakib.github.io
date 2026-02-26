---
permalink: /
title: " "
excerpt: "Robotics & AI Researcher | University of Dhaka | Research Assistant at Cortex AI Lab & CARS"
author_profile: true
redirect_from:
  - /about/
  - /about.html
---

<style>
/* ── Portfolio Custom Styles ───────────────────────────── */

/* Intro */
.port-intro p {
  font-size: 1.05em;
  line-height: 1.85;
  color: #444;
  margin-bottom: 0.6em;
}
.port-interests {
  margin-top: 10px;
  font-size: 0.92em;
  color: #555;
}
.port-interests strong { color: #2c3e50; }
.int-tag {
  display: inline-block;
  background: #eef2ff;
  color: #3730a3;
  border-radius: 20px;
  padding: 2px 12px;
  margin: 3px 3px;
  font-size: 0.88em;
  font-weight: 500;
}

/* Section headers */
.port-section-title {
  font-size: 1.2em;
  font-weight: 700;
  color: #1a202c;
  border-bottom: 2px solid #4f46e5;
  padding-bottom: 6px;
  margin: 36px 0 18px 0;
  display: flex;
  align-items: center;
  gap: 8px;
}

/* News */
.news-list { list-style: none; padding: 0; margin: 0; }
.news-list li {
  display: flex;
  gap: 14px;
  align-items: flex-start;
  padding: 7px 0;
  border-bottom: 1px solid #f0f0f0;
  font-size: 0.93em;
}
.news-list li:last-child { border-bottom: none; }
.news-date {
  min-width: 85px;
  color: #7c6f9f;
  font-weight: 600;
  font-size: 0.85em;
  padding-top: 2px;
}

/* Publication cards */
.pub-card {
  border: 1px solid #e2e8f0;
  border-left: 4px solid #4f46e5;
  border-radius: 8px;
  padding: 14px 16px;
  margin-bottom: 14px;
  background: #fafbff;
  transition: box-shadow 0.2s;
}
.pub-card:hover { box-shadow: 0 4px 16px rgba(79,70,229,0.1); }
.pub-num {
  display: inline-block;
  font-size: 0.78em;
  font-weight: 700;
  color: #4f46e5;
  background: #eef2ff;
  padding: 2px 9px;
  border-radius: 5px;
  margin-right: 8px;
}
.pub-title { font-weight: 600; font-size: 0.97em; color: #1e293b; }
.pub-meta { margin-top: 7px; display: flex; flex-wrap: wrap; gap: 6px; align-items: center; }
.pub-status {
  font-size: 0.78em;
  background: #fef9c3;
  color: #854d0e;
  padding: 2px 9px;
  border-radius: 4px;
  font-weight: 600;
}
.pub-venue {
  font-size: 0.82em;
  color: #dc2626;
  font-weight: 600;
  font-style: italic;
}
.pub-if {
  font-size: 0.78em;
  background: #dcfce7;
  color: #166534;
  padding: 2px 8px;
  border-radius: 4px;
  font-weight: 600;
}

/* Experience cards */
.exp-card {
  border-left: 4px solid #10b981;
  padding: 12px 16px;
  margin-bottom: 20px;
  background: #f9fafb;
  border-radius: 0 8px 8px 0;
}
.exp-card.orange { border-color: #f59e0b; }
.exp-card.purple { border-color: #8b5cf6; }
.exp-org { font-weight: 700; font-size: 0.98em; color: #1a202c; }
.exp-role { font-size: 0.85em; color: #6b7280; margin: 3px 0 8px 0; }
.exp-card ul { margin: 0; padding-left: 18px; }
.exp-card ul li { font-size: 0.91em; color: #374151; margin-bottom: 4px; }

/* Education table */
.edu-table { width: 100%; border-collapse: collapse; font-size: 0.93em; margin-top: 4px; }
.edu-table th {
  background: #f1f5f9;
  padding: 8px 12px;
  text-align: left;
  color: #374151;
  font-weight: 600;
  border-bottom: 2px solid #e2e8f0;
}
.edu-table td { padding: 10px 12px; border-bottom: 1px solid #f0f0f0; color: #4b5563; }
.edu-table tr:hover td { background: #fafafa; }
.badge-cgpa {
  display: inline-block;
  background: #dbeafe;
  color: #1d4ed8;
  border-radius: 5px;
  padding: 2px 10px;
  font-weight: 700;
  font-size: 0.9em;
}
.badge-gpa {
  display: inline-block;
  background: #dcfce7;
  color: #15803d;
  border-radius: 5px;
  padding: 2px 10px;
  font-weight: 700;
  font-size: 0.9em;
}

/* Awards */
.award-list { list-style: none; padding: 0; margin: 0; }
.award-list li {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 0;
  border-bottom: 1px solid #f3f4f6;
  font-size: 0.93em;
  color: #374151;
}
.award-list li:last-child { border-bottom: none; }
.award-year {
  min-width: 50px;
  font-size: 0.82em;
  color: #9ca3af;
  font-weight: 600;
}

/* Project cards */
.proj-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px;
  margin-top: 4px;
}
@media (max-width: 600px) { .proj-grid { grid-template-columns: 1fr; } }
.proj-card {
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 14px;
  background: white;
  transition: box-shadow 0.2s;
}
.proj-card:hover { box-shadow: 0 4px 16px rgba(0,0,0,0.08); }
.proj-title { font-weight: 700; font-size: 0.95em; color: #1e293b; margin-bottom: 6px; }
.proj-desc { font-size: 0.86em; color: #6b7280; line-height: 1.55; margin-bottom: 8px; }
.tech-tag {
  display: inline-block;
  font-size: 0.75em;
  background: #f1f5f9;
  color: #475569;
  padding: 2px 8px;
  border-radius: 4px;
  margin: 2px 2px 2px 0;
  font-weight: 500;
}
</style>

---

<div class="port-intro">
<p>
I am a final-year student in <strong>Robotics and Mechatronics Engineering</strong> at the <strong>University of Dhaka</strong>, working at the intersection of intelligent systems, multimodal AI, and real-world decision support. My research focuses on designing scalable AI solutions that translate advanced machine learning methods into practical applications across healthcare, agriculture, and critical infrastructure.
</p>
<p>
I currently hold two concurrent research positions — as a <strong>Research Assistant</strong> at <a href="https://cortexai-lab.github.io/" target="_blank" style="color:#4f46e5; font-weight:600;">Cortex AI Lab</a> and a <strong>Research Intern</strong> at the <a href="https://www.dndlab.org/" target="_blank" style="color:#4f46e5; font-weight:600;">Data and Design Lab (CARS)</a>. At Cortex AI Lab, my work centers on multimodal and agent-based AI, including vision-language systems for biomedical reasoning, visual question answering, and structured diagnostic support. At CARS, I develop large-scale data analytics and machine learning pipelines for power system monitoring, failure prediction, and reliability assessment using nationwide electricity and consumption data.
</p>
<p>
My broader research interests include multimodal learning, biomedical AI, agentic systems, and trustworthy AI. I have contributed to projects spanning plant disease diagnosis, vision-language benchmarking, power quality assessment, and autonomous robotic systems. I currently have <strong>five research papers under review</strong> at major venues, including <em>Nature Scientific Data</em>, <em>ICML 2026</em>, and <em>ACL 2026</em>.
</p>
<div class="port-interests">
  <strong>Research Interests: &nbsp;</strong>
  <span class="int-tag">Multimodal Learning</span>
  <span class="int-tag">Biomedical AI</span>
  <span class="int-tag">Vision-Language Models</span>
  <span class="int-tag">Agentic Systems</span>
  <span class="int-tag">Trustworthy AI</span>
  <span class="int-tag">Agricultural Technology</span>
</div>
</div>

<div class="port-section-title">📄 Publications &amp; Preprints</div>

<div class="pub-card">
  <span class="pub-num">01</span>
  <span class="pub-title">PATHWAYS: Evaluating Investigation and Context Discovery in AI Web Agents</span>
  <div class="pub-meta">
    <span class="pub-status">⏳ Under Review</span>
    <span class="pub-venue">ICML 2026</span>
    <a href="https://arxiv.org/pdf/2602.05354" target="_blank" style="font-size:0.78em; background:#f0f0f0; color:#b31b1b; padding:2px 9px; border-radius:4px; font-weight:600; text-decoration:none;">arXiv</a>
  </div>
</div>

<div class="pub-card">
  <span class="pub-num">02</span>
  <span class="pub-title">Thinking Like a Botanist: Challenging Multimodal Language Models with Intent Driven Chain-of-Inquiry</span>
  <div class="pub-meta">
    <span class="pub-status">⏳ Under Review</span>
    <span class="pub-venue">ACL 2026</span>
  </div>
</div>

<div class="pub-card">
  <span class="pub-num">03</span>
  <span class="pub-title">PlantVillageVQA: A Visual Question Answering Dataset for Benchmarking Vision-Language Models in Plant Science</span>
  <div class="pub-meta">
    <span class="pub-status">⏳ Under Review</span>
    <span class="pub-venue">Nature Scientific Data</span>
    <a href="https://arxiv.org/pdf/2508.17117" target="_blank" style="font-size:0.78em; background:#f0f0f0; color:#b31b1b; padding:2px 9px; border-radius:4px; font-weight:600; text-decoration:none;">arXiv</a>
  </div>
</div>

<div class="pub-card">
  <span class="pub-num">04</span>
  <span class="pub-title">SugarcaneShuffleNet: A Very Fast, Lightweight Convolutional Neural Network for Diagnosis of 15 Sugarcane Leaf Diseases</span>
  <div class="pub-meta">
    <span class="pub-status">⏳ Under Review</span>
    <span class="pub-venue">Computers and Electronics in Agriculture</span>
    <a href="https://arxiv.org/pdf/2508.17107" target="_blank" style="font-size:0.78em; background:#f0f0f0; color:#b31b1b; padding:2px 9px; border-radius:4px; font-weight:600; text-decoration:none;">arXiv</a>
  </div>
</div>

<div class="pub-card">
  <span class="pub-num">05</span>
  <span class="pub-title">Predicting Groundwater Recharge Potential across Various Physiographic Divisions of Bangladesh using Generative Data Augmentation</span>
  <div class="pub-meta">
    <span class="pub-status">⏳ Under Review</span>
    <span class="pub-venue">Journal of Hydrology</span>
  </div>
</div>

---

<div class="port-section-title">🔬 Research &amp; Professional Experience</div>

<div class="exp-card">
  <div class="exp-org"><a href="https://cortexai-lab.github.io/" target="_blank" style="color:inherit; text-decoration:none; border-bottom:1px dashed #aaa;">Cortex AI Lab</a>, University of Dhaka</div>
  <div class="exp-role">Research Assistant &nbsp;·&nbsp; Mar 2025 – Present</div>
  <ul>
    <li>Conduct research on <strong>agentic AI and collaborative multi-agent systems</strong>, focusing on coordinated reasoning, task decomposition, and autonomous decision-making in complex environments.</li>
    <li>Develop <strong>multimodal biomedical AI systems</strong> integrating vision and language for clinically relevant tasks such as:
      <ul>
        <li>Visual Question Answering for medical images</li>
        <li>Differential diagnosis support from imaging and clinical context</li>
        <li>Automated radiology report generation</li>
      </ul>
    </li>
    <li>Design and evaluate <strong>medical vision-language pipelines</strong> for robustness, interpretability, and clinical usability.</li>
    <li>Investigate architectures that combine <strong>agent-based reasoning with multimodal perception</strong>, enabling structured clinical reasoning workflows and human-aligned decision support.</li>
  </ul>
</div>

<div class="exp-card orange">
  <div class="exp-org"><a href="https://www.dndlab.org/" target="_blank" style="color:inherit; text-decoration:none; border-bottom:1px dashed #aaa;">Data and Design Lab (CARS)</a>, University of Dhaka</div>
  <div class="exp-role">Research Assistant Intern &nbsp;·&nbsp; Nov 2024 – Present</div>
  <ul>
    <li>Led large-scale analysis of <strong>power quality and reliability</strong> across multiple power distribution regions in Bangladesh.</li>
    <li>Processed and modeled heterogeneous data sources including:
      <ul>
        <li>Power quality meter data</li>
        <li>Load and consumption profiles</li>
        <li>Industrial and consumer billing records</li>
      </ul>
    </li>
    <li>Developed <strong>machine learning pipelines</strong> for failure prediction, anomaly detection, early fault identification, and load/demand forecasting.</li>
    <li>Built <strong>automated data engineering and model deployment workflows</strong> for scalable monitoring of power system health.</li>
    <li>Contributed to the development of an <strong>electricity-domain conversational assistant</strong>, enabling users to query billing issues, outages, and power quality concerns through natural language.</li>
  </ul>
</div>

<div class="exp-card" style="border-color:#06b6d4;">
  <div class="exp-org"><a href="https://robodemybd.com/" target="_blank" style="color:inherit; text-decoration:none; border-bottom:1px dashed #aaa;">Robodemy</a></div>
  <div class="exp-role">Trainer &nbsp;·&nbsp; Mar 2025 – Dec 2025</div>
  <ul>
    <li>Trained and mentored the <strong>Bangladesh National Robotics Olympiad team</strong>, contributing to their preparation for international competition and achieving <strong>gold medal performance</strong>.</li>
    <li>Served as <strong>Software Lead</strong> for the <strong>Durbar Mars Rover Team</strong>, developing autonomous control logic, sensor fusion pipelines, and mission software.</li>
    <li>Designed and implemented <strong>IoT-based robotic systems</strong> integrating microcontrollers, wireless communication, and real-time monitoring.</li>
    <li>Conducted structured training on robotics fundamentals, embedded systems, and algorithmic problem solving for competitive and research-oriented robotics.</li>
  </ul>
</div>

<div class="exp-card purple">
  <div class="exp-org"><a href="https://techtopiabd.com/" target="_blank" style="color:inherit; text-decoration:none; border-bottom:1px dashed #aaa;">Tech Topia</a>, Dhaka</div>
  <div class="exp-role">R&amp;D Engineer &nbsp;·&nbsp; Nov 2023 – Jul 2025</div>
  <ul>
    <li>Developed embedded robotic systems using <strong>Arduino and ESP32</strong> platforms.</li>
    <li>Designed <strong>industrial IoT solutions</strong> for monitoring, control, and automation.</li>
    <li>Implemented hardware-software integration for real-time sensing, actuation, and edge-level decision making.</li>
  </ul>
</div>

<div class="port-section-title">🏆 Awards &amp; Competitions</div>

<ul class="award-list">
  <li>
    <span>🌍</span>
    <span style="flex:1"><strong>Global Nominee</strong> — NASA Space Apps Challenge</span>
    <span class="award-year">2024</span>
  </li>
  <li>
    <span>🥈</span>
    <span style="flex:1"><strong>Runner-up</strong> — DU AI Challenge</span>
    <span class="award-year">2025</span>
  </li>
  <li>
    <span>🥈</span>
    <span style="flex:1"><strong>Runner-up</strong> — KUET Datathon</span>
    <span class="award-year">2025</span>
  </li>
  <li>
    <span>🥈</span>
    <span style="flex:1"><strong>Runner-up</strong> — Technocrats V2 IUBAT Hackathon</span>
    <span class="award-year">2024</span>
  </li>
  <li>
    <span>🏅</span>
    <span style="flex:1"><strong>Regional Champion</strong> — National High School Programming Contest (NHSPC)</span>
    <span class="award-year">2019</span>
  </li>
  <li>
    <span>🎖️</span>
    <span style="flex:1"><strong>Kaggle Expert</strong> — Multiple podium finishes in ML competitions</span>
    <span class="award-year">Ongoing</span>
  </li>
</ul>

---

<div class="port-section-title">💻 Featured Projects</div>

<div class="proj-grid">

  <div class="proj-card">
    <div class="proj-title">🤖 Mobile Differential Drive Robot</div>
    <div class="proj-desc">Full Gazebo simulation and ROS2 control stack for a mobile diff-drive robot. Built with URDF/Xacro modeling and a complete ROS2 integration pipeline.</div>
    <span class="tech-tag">ROS2</span>
    <span class="tech-tag">Gazebo</span>
    <span class="tech-tag">URDF/Xacro</span>
    <span class="tech-tag">Python</span>
  </div>

  <div class="proj-card">
    <div class="proj-title">📊 EDAPipeline</div>
    <div class="proj-desc">Automated exploratory data analysis Python package with smart visualization, outlier detection, and correlation analysis out of the box.</div>
    <span class="tech-tag">Python</span>
    <span class="tech-tag">Pandas</span>
    <span class="tech-tag">Matplotlib</span>
    <span class="tech-tag">Scikit-learn</span>
  </div>

  <div class="proj-card">
    <div class="proj-title">🔍 Pathfinding Visualizer</div>
    <div class="proj-desc">Interactive visualizer for classic pathfinding algorithms — DFS, A*, and Dynamic A* — with real-time animation built in Pygame.</div>
    <span class="tech-tag">Python</span>
    <span class="tech-tag">Pygame</span>
    <span class="tech-tag">A*</span>
    <span class="tech-tag">DFS</span>
  </div>

  <div class="proj-card">
    <div class="proj-title">🌐 RMEDU Robotronics Fest Website</div>
    <div class="proj-desc">Responsive event website for the university's annual Robotronics Festival, built with a modern Next.js and TypeScript stack.</div>
    <span class="tech-tag">Next.js</span>
    <span class="tech-tag">TypeScript</span>
    <span class="tech-tag">React</span>
  </div>

</div>
