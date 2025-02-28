---
layout: home
profile_picture:
  src: /assets/img/profile_fig_v3.jpg
  alt: website picture
news-items:
  - title: 2025.02.27
    description: "One paper is accepted by CVPR 2025. (WeakMCN: Multi-task Collaborative Network for Weakly Supervised Referring Expression Comprehension and Segmentation. Yang Liu*, Silin Cheng*,  Xinwei He, Sebastien Ourselin, Lei Tan, Gen Luo ) "
  - title: 2025.01.22
    description: "One paper is released to Arxiv. (CrossDiff: Diffusion Probabilistic Model With Cross-conditional Encoder-Decoder for Crack Segmentation. Xianglong Shi, Yunhan Jiang, Xiaoheng Jiang, Mingling Xu, Yang Liu)"
  - title: 2025.01.01
    description: "Part-time Data Scientist started at Proximie."
  - title: 2024.10.02
    description: "One paper is accepted by Medical Image Analysis. (LoViT: Long Video Transformer for Surgical Phase Recognition. Yang Liu, Maxence Boels, Luis C. Garcia-Peraza-Herrera, Tom Vercauteren, Prokar Dasgupta, Alejandro Granados, and Sebastien Ourselin) "
    link: "https://arxiv.org/pdf/2305.08989.pdf"
  - title: 2024.05
    description: "One paper is accepted by ISBI (as the last and corresponding author). (Gray Matter-Guided Attention Network for AD Diagnosis Using Structural MRI. Yanteng Zhang, Hongshun Cai, Yiming Du, Bingchao Xu, Yang Liu*)"
    link: https://ieeexplore.ieee.org/abstract/document/10635472
  - title: 2024.03
    description: "One paper is released to Arxiv (as co-first and corresponding author). (DDSB: An Unsupervised and Training-free Method for Phase Detection in Echocardiography. Zhenyu Bu*, Yang Liu*†, Jiayu Huo, Jingjing Peng, Kaini Wang, Guangquan Zhou, Rachel Sparks, Prokar Dasgupta, Alejandro Granados, Sebastien Ourselin)"
    link: https://arxiv.org/abs/2403.12787
  - title: 2024.03
    description: "One paper is released to Arxiv (as co-first and corresponding author). (Rethinking Low-quality Optical Flow in Unsupervised Surgical Instrument Segmentation. Peiran Wu*, Yang Liu*†, Jiayu Huo, Gongyu Zhang, Christos Bergeles, Rachel Sparks, Prokar Dasgupta, Alejandro Granados, Sebastien Ourselin)"
    link: https://arxiv.org/abs/2403.10039
  - title: 2024.02
    description: "One paper is released to Arxiv. (ArcSin: Adaptive ranged cosine Similarity injected noise for Language-Driven Visual Tasks. Yang Liu, Xiaomin Yu, Gongyu Zhang, Zhen Zhu, Christos Bergeles, Prokar Dasgupta, Alejandro Granados, and Sebastien Ourselin)"
    link: https://arxiv.org/abs/2402.17298
  - title: 2023.07
    description: "One paper is accepted by ICCV 2023. (SKiT: a Fast Key Information Video Transformer for Online Surgical Phase Recognition. Yang Liu, Jiayu Huo, Jingjing Peng, Rachel Sparks, Prokar Dasgupta, Alejandro Granados, and Sebastien Ourselin)"
    link: https://openaccess.thecvf.com/content/ICCV2023/html/Liu_SKiT_a_Fast_Key_Information_Video_Transformer_for_Online_Surgical_ICCV_2023_paper.html
  - title: 2023.05
    description: "One paper is released to Arxiv (under review). (LoViT: Long Video Transformer for Surgical Phase Recognition. Yang Liu, Maxence Boels, Luis C. Garcia-Peraza-Herrera, Tom Vercauteren, Prokar Dasgupta, Alejandro Granados, and Sebastien Ourselin) "
    link: "https://arxiv.org/pdf/2305.08989.pdf"
  - title: 2022.09
    description: "Our team CTRL won the 1st place on MICCCAI 2022 ATLAS Ischemic Stroke Lesion Segmentation Challenge."
    link: https://arxiv.org/pdf/2211.15486.pdf
  - title: "2021.10"
    description: Arrived at London and began the Ph.D student life at KCL.
  - title: 2021.06
    description: Completed the thesis defense and received a master's degree.
  - title: 2021.04
    description: Internship started at Education department of ByteDance, working as a computer vision algorithm engineer.
  - title: 2020.11
    description: One paper is accepted by WACV 2021.
  - title: 2020.02
    description: One paper is accepted by CVPR 2020.
    
publication-items:

  - image: "/assets/img/work/WDNet.jpg"
    title: "Wdnet: Watermark-decomposition network for visible watermark removal"
    authors: "Yang Liu, Zhen Zhu, Xiang Bai"
    venue: "WACV"
    year: "2021"
    pdf_url: "https://openaccess.thecvf.com/content/WACV2021/papers/Liu_WDNet_Watermark-Decomposition_Network_for_Visible_Watermark_Removal_WACV_2021_paper.pdf"
    code_url: "https://github.com/MRUIL/WDNet"
    
  - image: "/assets/img/work/SuperBPD.jpg"
    title: "Super Boundary-to-Pixel Direction for Fast Image Segmentation"
    authors: "Jianqiang Wan, Yang Liu, Donglai Wei, Xiang Bai, Yongchao Xu"
    venue: "CVPR"
    year: "2020"
    pdf_url: "https://openaccess.thecvf.com/content_CVPR_2020/papers/Wan_Super-BPD_Super_Boundary-to-Pixel_Direction_for_Fast_Image_Segmentation_CVPR_2020_paper.pdf"
    code_url: "https://github.com/JianqiangWan/Super-BPD"

work-items:
  - title: Super Boundary-to-Pixel Direction for Fast Image Segmentation
    image:
      src: /assets/img/work/SuperBPD.jpg
      alt: water
    description: Image segmentation is a fundamental vision task and a crucial step for many applications. In this paper, we propose a fast image segmentation method based on a novel super boundary-to-pixel direction (super-BPD) and a customized segmentation algorithm with super-BPD. Precisely, we define BPD on each pixel as a two-dimensional unit vector pointing from its nearest boundary to the pixel. In the BPD, nearby pixels from different regions have opposite directions departing from each other, and adjacent pixels in the same region have directions pointing to the other or each other (i.e., around medial points). We make use of such property to partition an image into super-BPDs, which are novel informative superpixels with robust direction similarity for fast grouping into segmentation regions. Extensive experimental results on BSDS500 and Pascal Context demonstrate the accuracy and efficency of the proposed super-BPD in segmenting images. In practice, the proposed super-BPD achieves comparable or superior performance with MCG while running at ~25fps vs. 0.07fps. Super-BPD also exhibits a noteworthy transferability to unseen scenes.
  - title: Watermark-Decomposition Network for Visible Watermark Removal
    image:
      src: /assets/img/work/WDNet.png
      alt: sand
    description: Visible watermarks are widely-used in images to protect copyright ownership. Analyzing watermark removal helps to reinforce the anti-attack techniques in an adversarial way. Current removal methods normally leverage image-to-image translation techniques. Nevertheless, the uncertainty of the size, shape, color and transparency of the watermarks set a huge barrier for these methods. To combat this, we combine traditional watermarked image decomposition into a two-stage generator, called Watermark-Decomposition Network (WDNet), where the first stage predicts a rough decomposition from the whole watermarked image and the second stage specifically centers on the watermarked area to refine the removal results. The decomposition formulation enables WDNet to separate watermarks from the images rather than simply removing them. We further show that these separated watermarks can serve as extra nutrients for building a larger training dataset and further improving removal performance. Besides, we construct a large-scale dataset named CLWD, which mainly contains colored watermarks, to fill the vacuum of colored watermark removal dataset. Extensive experiments on the public gray-scale dataset LVW and CLWD consistently show that the proposed WDNet outperforms the state-of-the-art approaches both in accuracy and efficiency.
---
---

<p>
  Welcome to the website of Yang Liu! I am a last-year PhD student at King's Colledge London supervised by <a href="https://scholar.google.com/citations?hl=en&user=SMvz9eEAAAAJ">Prof. Sebastian Ourselin</a>(first supervisor), <a href="https://scholar.google.com/citations?hl=en&user=9EMw-WYAAAAJ">Prof. Prokar Dasgupta</a>(second supervisor) and <a href="https://scholar.google.co.uk/citations?user=5vzyJOQAAAAJ&hl=en">Dr. Alejandro Granados Martinez</a>(third supervisor). I received my Master's degree from Huazhong University of Science and Technology in 2021, supervised by <a href="https://scholar.google.com/citations?user=UeltiQ4AAAAJ&hl=en">Prof. Xiang Bai</a>. My research interests are medical video recognition, image segmentation, image generation, etc.
</p>

