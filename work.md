---
layout: work
title: Publications
slug: /work
items:
  - title: Super-BPD: Super Boundary-to-Pixel Direction for Fast Image Segmentation
    image:
      src: /assets/img/work/water.png
      alt: water
    description: Image segmentation is a fundamental vision task and a crucial step for many applications. In this paper, we propose a fast image segmentation method based on a novel super boundary-to-pixel direction (super-BPD) and a customized segmentation algorithm with super-BPD. Precisely, we define BPD on each pixel as a two-dimensional unit vector pointing from its nearest boundary to the pixel. In the BPD, nearby pixels from different regions have opposite directions departing from each other, and adjacent pixels in the same region have directions pointing to the other or each other (i.e., around medial points). We make use of such property to partition an image into super-BPDs, which are novel informative superpixels with robust direction similarity for fast grouping into segmentation regions. Extensive experimental results on BSDS500 and Pascal Context demonstrate the accuracy and efficency of the proposed super-BPD in segmenting images. In practice, the proposed super-BPD achieves comparable or superior performance with MCG while running at ~25fps vs. 0.07fps. Super-BPD also exhibits a noteworthy transferability to unseen scenes.
  - title: WDNet: Watermark-Decomposition Network for Visible Watermark Removal
    image:
      src: /assets/img/work/sand.png
      alt: sand
    description: Visible watermarks are widely-used in images to protect copyright ownership. Analyzing watermark removal helps to reinforce the anti-attack techniques in an adversarial way. Current removal methods normally leverage image-to-image translation techniques. Nevertheless, the uncertainty of the size, shape, color and transparency of the watermarks set a huge barrier for these methods. To combat this, we combine traditional watermarked image decomposition into a two-stage generator, called Watermark-Decomposition Network (WDNet), where the first stage predicts a rough decomposition from the whole watermarked image and the second stage specifically centers on the watermarked area to refine the removal results. The decomposition formulation enables WDNet to separate watermarks from the images rather than simply removing them. We further show that these separated watermarks can serve as extra nutrients for building a larger training dataset and further improving removal performance. Besides, we construct a large-scale dataset named CLWD, which mainly contains colored watermarks, to fill the vacuum of colored watermark removal dataset. Extensive experiments on the public gray-scale dataset LVW and CLWD consistently show that the proposed WDNet outperforms the state-of-the-art approaches both in accuracy and efficiency.
---
Selected publications
<br />
<br />
