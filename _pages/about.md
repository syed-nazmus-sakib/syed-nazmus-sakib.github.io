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
  font-size: 1em;
  line-height: 1.75;
  color: #334155;
  margin-bottom: 0.9em;
  text-align: left;
}
.port-interests {
  margin-top: 16px;
  font-size: 0.92em;
  color: #475569;
}
.port-interests strong {
  display: block;
  margin-bottom: 5px;
  color: #64748b;
  font-size: 0.82em;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}
.port-intro a {
  color: #334155 !important;
  font-weight: 600;
  text-decoration-color: #cbd5e1;
  text-underline-offset: 2px;
}
.int-tag {
  display: inline-block;
  background: #f8fafc;
  color: #334155;
  border: 1px solid #e2e8f0;
  border-radius: 4px;
  padding: 3px 8px;
  margin: 3px 3px 3px 0;
  font-size: 0.82em;
  font-weight: 600;
}

/* Section headers */
.port-section-title {
  font-size: 1.12em;
  font-weight: 700;
  color: #0f172a;
  border-bottom: 1px solid #cbd5e1;
  padding-bottom: 8px;
  margin: 42px 0 16px 0;
  display: flex;
  align-items: center;
  letter-spacing: -0.01em;
  scroll-margin-top: 5rem;
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
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  padding: 15px 16px;
  margin-bottom: 12px;
  background: #fff;
  transition: border-color 0.2s, box-shadow 0.2s;
}
.pub-card:hover {
  border-color: #cbd5e1;
  box-shadow: 0 3px 12px rgba(15, 23, 42, 0.05);
}
.pub-title {
  font-weight: 700;
  font-size: 0.98em;
  color: #0f172a;
  display: block;
  margin-bottom: 7px;
  line-height: 1.45;
  text-decoration: none;
  transition: color 0.2s;
}
a.pub-title:hover { color: #334155; }
.pub-links {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}
.pub-links a {
  font-size: 0.8em;
  padding: 3px 9px;
  border-radius: 4px;
  font-weight: 600;
  text-decoration: none;
  transition: background 0.2s, border-color 0.2s;
  display: inline-flex;
  align-items: center;
  gap: 4px;
}
.pub-links .link-arxiv,
.pub-links .link-hf,
.pub-links .link-project {
  background: #fff;
  color: #475569;
  border: 1px solid #cbd5e1;
}
.pub-links .link-arxiv:hover,
.pub-links .link-hf:hover,
.pub-links .link-project:hover { background: #f8fafc; border-color: #94a3b8; }
.pub-info {
  font-size: 0.88em;
  color: #64748b;
}
.pub-info .pub-status-text {
  font-weight: 600;
  color: #334155;
}
.pub-info .pub-venue {
  font-weight: 700;
  color: #334155;
}

/* Experience cards */
.exp-card {
  border: 1px solid #e5e7eb !important;
  border-left: 3px solid #64748b !important;
  padding: 14px 16px;
  margin-bottom: 14px;
  background: #fff;
  border-radius: 0 6px 6px 0;
}
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
  padding: 10px 0;
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
  border-radius: 6px;
  padding: 16px;
  background: white;
  transition: border-color 0.2s, box-shadow 0.2s;
}
.proj-card:hover {
  border-color: #cbd5e1;
  box-shadow: 0 3px 12px rgba(15, 23, 42, 0.05);
}
.proj-title { font-weight: 700; font-size: 0.95em; color: #1e293b; margin-bottom: 6px; }
.proj-desc { font-size: 0.86em; color: #6b7280; line-height: 1.55; margin-bottom: 8px; }
.tech-tag {
  display: inline-block;
  font-size: 0.75em;
  background: #f1f5f9;
  color: #475569;
  border: 1px solid #e2e8f0;
  padding: 2px 8px;
  border-radius: 4px;
  margin: 2px 2px 2px 0;
  font-weight: 500;
}
</style>

<div class="port-intro">
<p>
I am a final-year student in <strong>Robotics and Mechatronics Engineering</strong> at the <strong>University of Dhaka</strong>. My research focuses on multimodal and agentic AI, trustworthy decision-making, and practical machine learning systems for healthcare, agriculture, and critical infrastructure.
</p>
<p>
I am a <strong>Research Assistant</strong> at <a href="https://cortexai-lab.github.io/" target="_blank" rel="noopener">Cortex AI Lab</a> and a <strong>Research Intern</strong> at the <a href="https://www.dndlab.org/" target="_blank" rel="noopener">Data and Design Lab (CARS)</a>. My work spans vision-language reasoning, multi-agent systems, and machine learning pipelines for power-system monitoring. My publications include public preprints and work accepted at <em>ACL 2026 Findings</em>.
</p>
<div class="port-interests">
  <strong>Research Interests</strong>
  <span class="int-tag">Multimodal Learning</span>
  <span class="int-tag">Vision-Language Models</span>
  <span class="int-tag">Biomedical AI</span>
  <span class="int-tag">Agentic AI</span>
  <span class="int-tag">Trustworthy AI</span>
  <span class="int-tag">Reinforcement Learning</span>
</div>
</div>

<div class="port-section-title" id="research">Publications &amp; Manuscripts</div>

<div class="pub-card">
  <a href="https://arxiv.org/abs/2602.05354" target="_blank" rel="noopener" class="pub-title">PATHWAYS: Evaluating Investigation and Context Discovery in AI Web Agents</a>
  <div class="pub-links">
    <a href="https://arxiv.org/abs/2602.05354" target="_blank" rel="noopener" class="link-arxiv">Paper</a>
  </div>
  <div class="pub-info"><span class="pub-status-text">Preprint</span> · 2026</div>
</div>

<div class="pub-card">
  <span class="pub-title">Thinking Like a Botanist: Challenging Multimodal Language Models with Intent Driven Chain-of-Inquiry</span>
  <div class="pub-links">
    <a href="https://syed-nazmus-sakib.github.io/PlantInquiryVQA/" target="_blank" rel="noopener" class="link-project">Project page</a>
  </div>
  <div class="pub-info"><span class="pub-status-text">Accepted</span> at <span class="pub-venue">ACL 2026 Findings</span></div>
</div>

<div class="pub-card">
  <a href="https://arxiv.org/abs/2508.17117" target="_blank" rel="noopener" class="pub-title">PlantExpertVQA: A Visual Question Answering Dataset for Benchmarking Vision-Language Models in Plant Science</a>
  <div class="pub-links">
    <a href="https://arxiv.org/abs/2508.17117" target="_blank" rel="noopener" class="link-arxiv">Paper</a>
  </div>
  <div class="pub-info"><span class="pub-status-text">Under Review</span> at <span class="pub-venue">Nature Scientific Data</span></div>
</div>

<div class="pub-card">
  <a href="https://arxiv.org/abs/2508.17107" target="_blank" rel="noopener" class="pub-title">SugarcaneShuffleNet: A Very Fast, Lightweight Convolutional Neural Network for Diagnosis of 15 Sugarcane Leaf Diseases</a>
  <div class="pub-links">
    <a href="https://arxiv.org/abs/2508.17107" target="_blank" rel="noopener" class="link-arxiv">Paper</a>
  </div>
  <div class="pub-info"><span class="pub-status-text">Under Review</span> at <span class="pub-venue">Computers and Electronics in Agriculture</span></div>
</div>

<div class="pub-card">
  <span class="pub-title">MemeEconomy: Do LLM Agents Trade Ethics for Survival?</span>
  <div class="pub-info"><span class="pub-status-text">Manuscript</span> · 2026</div>
</div>

<div class="pub-card">
  <span class="pub-title">The Surface You Test Is Not the Surface That Breaks</span>
  <div class="pub-links">
    <a href="https://github.com/syed-nazmus-sakib/surface-adaptive-injection" target="_blank" rel="noopener" class="link-project">Code</a>
  </div>
  <div class="pub-info"><span class="pub-status-text">Manuscript</span> · 2026</div>
</div>

<div class="pub-card">
  <span class="pub-title">PhyDrawGen: Physically Grounded Diagram Generation from Natural Language</span>
  <div class="pub-info"><span class="pub-status-text">Manuscript</span> · 2026</div>
</div>

<div class="pub-card">
  <span class="pub-title">Predicting Groundwater Recharge Potential across Various Physiographic Divisions of Bangladesh using Generative Data Augmentation</span>
  <div class="pub-info"><span class="pub-status-text">Manuscript</span> · 2026</div>
</div>

<div class="port-section-title" id="experience">Research &amp; Professional Experience</div>

<div class="exp-card">
  <div class="exp-org"><a href="https://cortexai-lab.github.io/" target="_blank" style="color:inherit; text-decoration:none; border-bottom:1px dashed #aaa;">Cortex AI Lab</a>, University of Dhaka</div>
  <div class="exp-role">Research Assistant &nbsp;·&nbsp; Mar 2025 – Present</div>
  <ul>
    <li>Conduct research on <strong>agentic AI and collaborative multi-agent systems</strong>, focusing on coordinated reasoning, task decomposition, and autonomous decision-making in complex environments.</li>
    <li>Investigate <strong>safety and alignment of multi-agent systems</strong>, including:
      <ul>
        <li>Behavior of LLM agents under competitive and survival pressures</li>
        <li>Adversarial robustness and prompt-injection attack surfaces</li>
        <li>Investigation and context-discovery behavior in autonomous web agents</li>
      </ul>
    </li>
    <li>Develop <strong>vision-language systems for plant-pathology reasoning</strong>, building intent-driven visual question answering benchmarks and chain-of-inquiry evaluation pipelines.</li>
    <li>Design and evaluate <strong>multimodal VQA pipelines</strong> for robustness, interpretability, and trustworthy decision support.</li>
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

<div class="port-section-title" id="awards">Awards &amp; Competitions</div>

<ul class="award-list">
  <li>
    <span style="flex:1"><strong>Global Nominee</strong> — NASA Space Apps Challenge</span>
    <span class="award-year">2024</span>
  </li>
  <li>
    <span style="flex:1"><strong>Runner-up</strong> — DU AI Challenge</span>
    <span class="award-year">2025</span>
  </li>
  <li>
    <span style="flex:1"><strong>Runner-up</strong> — KUET Datathon</span>
    <span class="award-year">2025</span>
  </li>
  <li>
    <span style="flex:1"><strong>Runner-up</strong> — Technocrats V2 IUBAT Hackathon</span>
    <span class="award-year">2024</span>
  </li>
  <li>
    <span style="flex:1"><strong>Regional Champion</strong> — National High School Programming Contest (NHSPC)</span>
    <span class="award-year">2019</span>
  </li>
  <li>
    <span style="flex:1"><strong>Kaggle Expert</strong> — Multiple podium finishes in ML competitions</span>
    <span class="award-year">Ongoing</span>
  </li>
</ul>

<div class="port-section-title" id="lectures">Lecture Series</div>

<div class="pub-card">
  <a href="/lectures/rl/" class="pub-title">Pearl: A Reinforcement Learning Lecture Series</a>
  <div class="pub-links">
    <a href="/lectures/rl/why.html" class="link-project">Start at Lecture 00</a>
    <a href="/lectures/rl/practice.html" class="link-project">Interactive Practice</a>
  </div>
  <div class="pub-info">
    A self-contained, interactive web lecture series on reinforcement learning — from Markov Decision Processes, value functions, and Bellman equations through dynamic programming, temporal-difference learning, Q-learning &amp; DQN, and on to modern policy optimization: policy gradients, TRPO, PPO, and GRPO. Ten lectures with in-browser visualizations, plus a unified gridworld playground for hands-on practice.
  </div>
</div>

<div class="port-section-title" id="projects">Selected Engineering Projects</div>

<div class="proj-grid">

  <div class="proj-card">
    <div class="proj-title">Mobile Differential Drive Robot</div>
    <div class="proj-desc">Full Gazebo simulation and ROS2 control stack for a mobile diff-drive robot. Built with URDF/Xacro modeling and a complete ROS2 integration pipeline.</div>
    <span class="tech-tag">ROS2</span>
    <span class="tech-tag">Gazebo</span>
    <span class="tech-tag">URDF/Xacro</span>
    <span class="tech-tag">Python</span>
  </div>

  <div class="proj-card">
    <div class="proj-title">EDAPipeline</div>
    <div class="proj-desc">Automated exploratory data analysis Python package with smart visualization, outlier detection, and correlation analysis out of the box.</div>
    <span class="tech-tag">Python</span>
    <span class="tech-tag">Pandas</span>
    <span class="tech-tag">Matplotlib</span>
    <span class="tech-tag">Scikit-learn</span>
  </div>

  <div class="proj-card">
    <div class="proj-title">Pathfinding Visualizer</div>
    <div class="proj-desc">Interactive visualizer for classic pathfinding algorithms — DFS, A*, and Dynamic A* — with real-time animation built in Pygame.</div>
    <span class="tech-tag">Python</span>
    <span class="tech-tag">Pygame</span>
    <span class="tech-tag">A*</span>
    <span class="tech-tag">DFS</span>
  </div>

  <div class="proj-card">
    <div class="proj-title">RMEDU Robotronics Fest Website</div>
    <div class="proj-desc">Responsive event website for the university's annual Robotronics Festival, built with a modern Next.js and TypeScript stack.</div>
    <span class="tech-tag">Next.js</span>
    <span class="tech-tag">TypeScript</span>
    <span class="tech-tag">React</span>
  </div>

</div>
