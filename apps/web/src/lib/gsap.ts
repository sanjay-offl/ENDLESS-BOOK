import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { MotionPathPlugin } from "gsap/MotionPathPlugin";
import { Flip } from "gsap/Flip";
import { SplitText } from "gsap/SplitText";
import { DrawSVGPlugin } from "gsap/DrawSVGPlugin";
import { MorphSVGPlugin } from "gsap/MorphSVGPlugin";

gsap.registerPlugin(
  ScrollTrigger,
  MotionPathPlugin,
  Flip,
  SplitText,
  DrawSVGPlugin,
  MorphSVGPlugin
);

export { gsap, ScrollTrigger, MotionPathPlugin, Flip, SplitText, DrawSVGPlugin, MorphSVGPlugin };
export default gsap;
