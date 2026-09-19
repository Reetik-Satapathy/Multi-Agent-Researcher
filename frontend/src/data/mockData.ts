import type { Paper, ResearchReport, Project, UserProfile } from '../types/research';

export const INITIAL_USER: UserProfile = {
  name: 'Dr. Alex Vance',
  email: 'alex.vance@stanford.edu',
  role: 'Principal AI & BioMed Researcher',
  institution: 'Stanford Institute for Human-Centered AI',
  avatar: '',
  stats: {
    savedPapers: 42,
    reports: 18,
    comparisons: 29,
    projects: 6,
  }
};

export const MOCK_PAPERS: Paper[] = [
  {
    id: 'paper-001',
    title: 'Self-Correction in Large Language Models via Multi-Agent Debates and Verification Loops',
    authors: ['Dr. Sarah Jenkins', 'Prof. Marcus Thorne', 'Elena Rostova', 'Dr. David Chen'],
    year: 2025,
    journal: 'NeurIPS 2025 / arXiv',
    doi: '10.48550/arXiv.2501.08921',
    url: 'https://arxiv.org/abs/2501.08921',
    citations: 342,
    openAccess: true,
    area: 'Artificial Intelligence',
    abstract: 'Large Language Models (LLMs) frequently suffer from subtle reasoning fallacies and hallucinations when addressing complex multi-step reasoning. In this work, we introduce VERIFY-AGENT, an autonomous multi-agent verification framework where distinct specialized models simulate formal academic peer reviews, cross-examine reasoning trajectories, and execute execution-trace verification. Our empirical results demonstrate a 28.4% reduction in logical errors on GSM8K and MATH benchmarks without requiring human supervision or fine-tuning underlying weights.',
    methodology: 'Iterative multi-agent debate with symbolic reasoning constraints and automated code execution sandbox verification.',
    keyFindings: [
      'Multi-agent cross-examination resolves over 64% of self-consistency errors in mathematical reasoning.',
      'Verification overhead adds only 14% latency compared to standard chain-of-thought prompting.',
      'Achieves state-of-the-art accuracy on MATH-500 benchmark (89.2% accuracy).'
    ],
    limitations: [
      'Slight increase in token context consumption during multi-turn debate rounds.',
      'May stagnate when all participating agents share the same base pre-training bias.'
    ],
    isSaved: true,
  },
  {
    id: 'paper-002',
    title: 'Multimodal Spatial Reasoning in Clinical Pathology: Graph Transformer Architectures for Whole-Slide Imaging',
    authors: ['Dr. Aris Thorne', 'Dr. Mei-Ling Zhou', 'James K. Vance', 'Prof. Henrik Lindqvist'],
    year: 2025,
    journal: 'Nature Medicine & Machine Intelligence',
    doi: '10.1038/s41591-025-03412-x',
    url: 'https://nature.com/articles/s41591-025-03412-x',
    citations: 189,
    openAccess: true,
    area: 'Medicine',
    abstract: 'Accurate histological diagnosis from Gigapixel Whole-Slide Images (WSI) requires integration of cellular-scale features with tissue-level spatial microenvironments. We propose PathoGraph-3D, a hierarchical graph transformer that constructs topological graphs from cell nuclei embeddings and multi-scale visual features. Tested on 4,500 patient biopsies across 8 tumor types, PathoGraph-3D outperforms current MIL (Multiple Instance Learning) methods by 9.4% AUC in early tumor margin detection.',
    methodology: 'Cellular segmentations via Nuclei-Segmenter followed by Spatial Graph Transformer feature aggregation.',
    keyFindings: [
      'Hierarchical graphs capture micro-environmental immune cell density better than visual transformers.',
      'Reduces false negative diagnosis of rare metastatic lesions by 31%.',
      'Interpretable spatial attention maps correlate 94% with expert pathologist annotations.'
    ],
    limitations: [
      'High GPU memory usage during initial slide graph construction.',
      'Requires slide staining consistency across medical centers.'
    ],
    isSaved: true,
  },
  {
    id: 'paper-003',
    title: 'Quantum Variational Circuits for High-Dimensional Protein Folding Landscapes',
    authors: ['Prof. Leonard Krauss', 'Dr. Amara Okafor', 'Dr. Kenji Sato'],
    year: 2024,
    journal: 'IEEE Transactions on Quantum Engineering',
    doi: '10.1109/TQE.2024.3391024',
    url: 'https://ieee.org/document/3391024',
    citations: 512,
    openAccess: false,
    area: 'Physics',
    abstract: 'Simulating energy landscapes of long-chain proteins remains computationally intractable for classical algorithms due to exponential state space explosion. Here, we implement a hybrid Quantum-Classical Variational Eigensolver (VQ-Protein) optimized for noisy intermediate-scale quantum (NISQ) devices. By combining tensor network contraction with error mitigation protocols, VQ-Protein computes binding affinity metrics for 120-residue peptide chains in 18 minutes on a 127-qubit system.',
    methodology: 'Parameterized Quantum Circuits (PQC) coupled with Classical L-BFGS optimizer and zero-noise extrapolation.',
    keyFindings: [
      'Quantum superposition enables exploration of complex conformation barriers 40x faster than Classical Molecular Dynamics.',
      'Error-mitigated circuits show high fidelity even under 0.1% gate noise.',
      'Predicts protein-ligand binding free energy within 0.8 kcal/mol of experimental crystal structure assays.'
    ],
    limitations: [
      'Constrained by current qubit decoherence lifetimes.',
      'Requires precise calibration of native hardware gate sets.'
    ],
    isSaved: false,
  },
  {
    id: 'paper-004',
    title: 'Zero-Shot Robotic Manipulation via Embodied Vision-Language-Action Pre-Training',
    authors: ['Dr. Maya Lin', 'Devon Ross', 'Prof. Hiroshi Tanaka', 'Dr. Sarah Jenkins'],
    year: 2026,
    journal: 'Robotics: Science and Systems (RSS 2026)',
    doi: '10.15607/RSS.2026.XXIV.042',
    url: 'https://robotics-conference.org/2026/042',
    citations: 94,
    openAccess: true,
    area: 'Robotics',
    abstract: 'Bridging high-level semantic reasoning and low-level motor control is a fundamental goal in embodied artificial intelligence. We present OMNI-ACT, a unified 7B parameters Vision-Language-Action (VLA) model trained on 2.4 million real-world robotic interaction trajectories across diverse hardware arms. OMNI-ACT performs zero-shot dexterous manipulation tasks in unseen kitchen and laboratory settings from natural language instructions ("Organize the vials by temperature label").',
    methodology: 'Continuous action space tokenization integrated into auto-regressive transformer decoder architecture.',
    keyFindings: [
      'Achieves 84.6% task success rate across 150 novel unseen physical environments.',
      'Exhibits emergent error recovery when objects slip or move unexpectedly during execution.',
      'Operates in real-time at 30Hz control frequency on edge compute hardware.'
    ],
    limitations: [
      'Challenged by transparent glassware and high-reflectivity metallic surfaces.',
      'Requires tactile feedback sensors for sub-millimeter force control tasks.'
    ],
    isSaved: true,
  },
  {
    id: 'paper-005',
    title: 'Neuromorphic Spiking Architectures for Energy-Efficient Real-Time Brain-Computer Interfaces',
    authors: ['Dr. Clara Vogel', 'Julian Meyer', 'Prof. Anthony Russo'],
    year: 2025,
    journal: 'Journal of Neural Engineering & Neuroscience',
    doi: '10.1088/1741-2552/2025/gne091',
    url: 'https://iopscience.iop.org/article/10.1088/1741-2552/2025/gne091',
    citations: 215,
    openAccess: true,
    area: 'Neuroscience',
    abstract: 'Implantable Brain-Computer Interfaces (BCIs) are stringently power-constrained (< 15mW thermal dissipation safety limit). Traditional deep learning decoding algorithms consume excessive power, limiting multi-channel continuous streaming. We present NeuroSpike-V, a bio-inspired Spiking Neural Network (SNN) implemented on custom sub-threshold neuromorphic hardware. NeuroSpike-V decodes 1,024-channel motor cortex spike trains into 3D arm trajectories while drawing only 2.1mW of power.',
    methodology: 'Surrogate gradient learning with temporal leaky integrate-and-fire (LIF) neuron models.',
    keyFindings: [
      'Reduces power consumption by 93% compared to conventional LSTM decoders.',
      'Latency between neural firing and mechanical actuation reduced to 4.2 milliseconds.',
      'Stable decoding performance sustained over 180 days of continuous animal testing.'
    ],
    limitations: [
      'Training SNNs requires specialized temporal backpropagation algorithms.',
      'High hardware sensitivity to thermal drift.'
    ],
    isSaved: false,
  },
  {
    id: 'paper-006',
    title: 'Linear Attention Mechanisms for Million-Token Context Windows in Scientific Corpus Mining',
    authors: ['Elena Rostova', 'Dr. David Chen', 'Prof. Marcus Thorne'],
    year: 2025,
    journal: 'ACL 2025 / Empirical Methods in NLP',
    doi: '10.18653/v1/2025.acl-long.89',
    url: 'https://aclanthology.org/2025.acl-long.89',
    citations: 167,
    openAccess: true,
    area: 'Computer Science',
    abstract: 'Quadratic computational complexity of standard Transformer self-attention scales poorly when ingesting entire books, patent databases, or decades of journal archives. We introduce HYPER-ATTN, a state-space augmented linear attention mechanism that maintains sub-quadratic O(N log N) time and memory complexity up to 2 million tokens. Evaluated on long-context scientific QA benchmarks, HYPER-ATTN retains 98.2% needle-in-a-haystack retrieval accuracy.',
    methodology: 'State-space decay matrices combined with sparse flash-attention kernels.',
    keyFindings: [
      'Processes 1,000,000 token scientific literature review in under 1.2 seconds.',
      'Zero degradation in recall accuracy for facts buried deep in middle context windows.',
      'Reduces GPU VRAM requirement by 78% compared to standard Llama architectures.'
    ],
    limitations: [
      'Requires custom CUDA kernel installation for optimal throughput.',
      'Minor drop in fine-grained syntactic parsing on short sentences (< 20 tokens).'
    ],
    isSaved: false,
  },
  {
    id: 'paper-007',
    title: 'Attention Is All You Need',
    authors: ['Ashish Vaswani', 'Noam Shazeer', 'Niki Parmar', 'Jakob Uszkoreit'],
    year: 2017,
    journal: 'NeurIPS 2017',
    doi: '10.48550/arXiv.1706.03762',
    url: 'https://arxiv.org/abs/1706.03762',
    citations: 112000,
    openAccess: true,
    area: 'Artificial Intelligence',
    abstract: 'The dominant sequence transduction models are based on complex recurrent or convolutional neural networks that include an encoder and a decoder. We propose the Transformer, a new architecture based entirely on attention mechanisms, dispensing with recurrence and convolutions entirely. Experiments on two machine translation tasks show these models to be superior in quality while being more parallelizable and requiring significantly less time to train, achieving 28.4 BLEU on WMT 2014 English-to-German.',
    methodology: 'Multi-head self-attention with positional encoding and stacked encoder-decoder blocks.',
    keyFindings: [
      'Self-attention alone outperforms recurrent and convolutional transduction models.',
      'Achieves 28.4 BLEU on WMT 2014 English-to-German translation.',
      'Trains in a fraction of the time required by prior recurrent architectures.'
    ],
    limitations: [
      'Quadratic memory complexity with respect to sequence length.',
      'Requires large training corpora to outperform recurrent baselines.'
    ],
    isSaved: true,
  },
  {
    id: 'paper-008',
    title: 'Deep Learning for Medical Image Analysis',
    authors: ['Geert Litjens', 'Thijs Kooi', 'Babak Ehteshami Bejnordi', 'Clara I. Sánchez'],
    year: 2017,
    journal: 'Medical Image Analysis',
    doi: '10.1016/j.media.2017.07.005',
    url: 'https://www.sciencedirect.com/science/article/pii/S1361841517301135',
    citations: 8400,
    openAccess: true,
    area: 'Medicine',
    abstract: 'This paper surveys the use of deep learning in medical image analysis across a broad range of applications: classification, detection, segmentation, registration, and enhancement. Covering more than 300 contributions, the review shows deep learning consistently outperforming hand-crafted feature pipelines across 10 medical specialties, while highlighting challenges in annotation cost, interpretability, and dataset shift.',
    methodology: 'Systematic review of convolutional and recurrent architectures across clinical imaging modalities.',
    keyFindings: [
      'Deep learning matches or exceeds expert-level performance in detection and segmentation tasks.',
      'Convolutional architectures dominate across all imaging modalities surveyed.',
      'Annotation scarcity remains the dominant bottleneck for clinical adoption.'
    ],
    limitations: [
      'Heavy dependence on large annotated datasets.',
      'Poor generalization across scanners, centers, and acquisition protocols.'
    ],
    isSaved: false,
  },
  {
    id: 'paper-009',
    title: 'Large Language Models in Healthcare: Systematic Review of Clinical Applications',
    authors: ['Justin C. Yang', 'Ayesha S. Rasool', 'Roxana Daneshjou', 'Jonathan H. Chen'],
    year: 2024,
    journal: 'npj Digital Medicine',
    doi: '10.1038/s41746-024-01062-z',
    url: 'https://www.nature.com/articles/s41746-024-01062-z',
    citations: 640,
    openAccess: true,
    area: 'Medicine',
    abstract: 'Large language models (LLMs) are increasingly evaluated for clinical documentation, question answering, patient triage, and medical education. This systematic review synthesizes 92 studies assessing LLM performance against clinician baselines. While LLMs approach clinician-level accuracy on knowledge benchmarks, gaps persist in factual grounding, calibration of uncertainty, and safe integration into clinical workflows.',
    methodology: 'PRISMA-guided systematic review of LLM evaluations across clinical tasks and specialties.',
    keyFindings: [
      'LLMs reach near-parity with clinicians on medical knowledge benchmarks.',
      'Retrieval augmentation substantially reduces hallucinated clinical facts.',
      'Human-in-the-loop review remains essential for high-stakes deployment.'
    ],
    limitations: [
      'Benchmark performance does not guarantee bedside safety.',
      'Limited evaluation on underrepresented patient populations.'
    ],
    isSaved: false,
  },
  {
    id: 'paper-010',
    title: 'Transformers in Natural Language Processing: A Survey of Architectures and Applications',
    authors: ['Chandan Nath', 'Nikhil P. Shukla', 'Derek F. Wong'],
    year: 2024,
    journal: 'ACM Computing Surveys',
    doi: '10.1145/3635555',
    url: 'https://dl.acm.org/doi/10.1145/3635555',
    citations: 380,
    openAccess: false,
    area: 'Computer Science',
    abstract: 'Since the introduction of the Transformer, attention-based architectures have reshaped natural language processing. This survey organizes the transformer landscape into encoder-only, decoder-only, and encoder-decoder families, reviewing pre-training objectives, efficiency techniques, and applications from machine translation to retrieval-augmented generation, and outlining open challenges in reasoning, factuality, and efficiency.',
    methodology: 'Taxonomic survey of transformer variants, training objectives, and efficiency optimizations.',
    keyFindings: [
      'Attention-based architectures now dominate every major NLP benchmark category.',
      'Efficiency variants (sparse, linear, FlashAttention) reduce inference cost by 40-80%.',
      'Retrieval-augmented generation is the dominant strategy for factual grounding.'
    ],
    limitations: [
      'Survey coverage excludes non-English monolingual literature.',
      'Rapid field evolution dates specific benchmark comparisons quickly.'
    ],
    isSaved: false,
  }
];

export const MOCK_PROJECTS: Project[] = [
  {
    id: 'proj-1',
    title: 'AI in Healthcare & Clinical Pathology',
    description: 'Investigating deep learning graph architectures for histology, early tumor detection, and diagnostic automation.',
    paperCount: 12,
    reportCount: 3,
    comparisonCount: 4,
    lastUpdated: '2 hours ago',
    tags: ['Medicine', 'Graph Transformers', 'Pathology'],
    papers: [MOCK_PAPERS[1]],
    reports: []
  },
  {
    id: 'proj-2',
    title: 'Large Language Model Self-Correction & Reasoning',
    description: 'Researching multi-agent verification, formal logic checks, and needle-in-a-haystack scientific corpus mining.',
    paperCount: 8,
    reportCount: 2,
    comparisonCount: 3,
    lastUpdated: '1 day ago',
    tags: ['AI', 'LLMs', 'Multi-Agent', 'Reasoning'],
    papers: [MOCK_PAPERS[0], MOCK_PAPERS[5]],
    reports: []
  },
  {
    id: 'proj-3',
    title: 'Quantum Neural Networks & Bio-Simulation',
    description: 'Quantum-classical variational algorithms for peptide energy landscapes and drug discovery pipelines.',
    paperCount: 15,
    reportCount: 5,
    comparisonCount: 2,
    lastUpdated: '3 days ago',
    tags: ['Physics', 'Quantum Computing', 'Proteins'],
    papers: [MOCK_PAPERS[2]],
    reports: []
  },
  {
    id: 'proj-4',
    title: 'Embodied Robotics & Neuromorphic BCIs',
    description: 'Real-time motor control decoders, SNN architectures, and vision-language-action models.',
    paperCount: 6,
    reportCount: 1,
    comparisonCount: 2,
    lastUpdated: '5 days ago',
    tags: ['Robotics', 'Neuroscience', 'SNN', 'BCI'],
    papers: [MOCK_PAPERS[3], MOCK_PAPERS[4]],
    reports: []
  }
];

export const MOCK_REPORTS: ResearchReport[] = [
  {
    id: 'rep-001',
    title: 'State-of-the-Art in LLM Logical Verification and Self-Correction',
    type: 'Literature Review',
    sourcePapers: [MOCK_PAPERS[0], MOCK_PAPERS[5]],
    date: '2026-08-28',
    wordCount: 3420,
    tags: ['AI', 'Verification', 'Multi-Agent'],
    sections: [
      {
        id: 'sec-1',
        title: 'Executive Introduction',
        content: 'Large Language Models have revolutionized natural language understanding, yet their deployment in high-stakes domains—such as medical diagnostics, legal analysis, and automated code synthesis—remains constrained by hallucinations and logical degradation over extended reasoning trajectories.\n\nThis literature review synthesizes recent breakthroughs in self-correction frameworks, specifically examining multi-agent debate protocols, formal symbolic verifiers, and linear attention architectures optimized for scientific corpus ingestion.'
      },
      {
        id: 'sec-2',
        title: 'Multi-Agent Verification Architecture',
        content: 'As demonstrated by Jenkins et al. (2025) in *Self-Correction in LLMs via Multi-Agent Debates*, decomposing reasoning into peer review roles dramatically lowers hallucination rates. The system instantiates three distinct agent personas:\n\n1. **Generator Agent**: Produces candidate step-by-step mathematical trajectories.\n2. **Critic Agent**: Scrutinizes premise validity and identifies logical leaps.\n3. **Verifier Agent**: Executes code sandbox trace checks to confirm numerical assertions.'
      },
      {
        id: 'sec-3',
        title: 'Long-Context Technical Evaluation',
        content: 'Complementing agent verification, Rostova et al. (2025) demonstrated that processing comprehensive literature archives requires state-space augmented linear attention (HYPER-ATTN). Combining linear attention with multi-agent verifiers creates a robust pipeline capable of digesting 1,000,000 tokens of prior work while maintaining 98.2% recall fidelity.'
      },
      {
        id: 'sec-4',
        title: 'Comparative Findings & Benchmarks',
        content: 'Key benchmark achievements compiled across the reviewed literature:\n\n- **GSM8K & MATH-500**: +28.4% logical accuracy boost over baseline zero-shot prompting.\n- **Latency Tradeoff**: 14% execution time increase, compensated by a 64% reduction in manual verification overhead.\n- **Context Recall**: 98.2% accuracy sustained across 2M token context windows.'
      },
      {
        id: 'sec-5',
        title: 'Critical Limitations & Future Scope',
        content: 'Despite marked improvements, current architectures exhibit key failure modes when participating model agents share common pre-training dataset artifacts. Future research must explore heterogenous agent ensembles trained on fundamentally disjoint corpora to eliminate correlated hallucination bias.'
      },
      {
        id: 'sec-6',
        title: 'References & Citations',
        content: '1. Jenkins, S., Thorne, M., Rostova, E., & Chen, D. (2025). Self-Correction in Large Language Models via Multi-Agent Debates and Verification Loops. *NeurIPS 2025*.\n2. Rostova, E., Chen, D., & Thorne, M. (2025). Linear Attention Mechanisms for Million-Token Context Windows in Scientific Corpus Mining. *ACL 2025*.'
      }
    ]
  }
];
