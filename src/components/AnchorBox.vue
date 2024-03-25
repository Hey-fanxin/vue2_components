<template>
  <div ref="anchorRef" class="anchor-box">
    <div ref="markerRef" class="anchor-marker" :style="markerStyle" />
    <div class="anchor-list">
      <slot />
    </div>
  </div>
</template>

<script>
import {
  getScrollElement,
  getOffsetTopDistance,
  animateScrollTo,
  throttleByRaf,
  getScrollTop,
} from "@/utils/domUtils.js";
export default {
  name: "AnchorBox",
  props: {
    offset: {
      type: Number,
      default: 60,
    },
    duration: {
      type: Number,
      default: 300,
    },
    bound: {
      type: Number,
      default: 15,
    },
    direction: {
      type: String,
      default: "horizontal",
    },
  },
  provide() {
    return {
      direction: this.direction,
      currentAnchor: () => this.currentAnchor,
      addLink: this.addLink,
      removeLink: this.removeLink,
      handleClick: this.handleClick,
      containerEl: null,
    };
  },
  data() {
    return {
      isView: false,
      links: {},
      isScrolling: false,
      currentScrollTop: 0,
      currentAnchor: "#base",
      clearAnimate: null,
      handleScroll: throttleByRaf(() => {
        this.currentScrollTop = getScrollTop(this.containerEl);
        const currentHref = this.getCurrentHref();
        if (this.isScrolling || currentHref === undefined) return;
        this.setCurrentAnchor(currentHref);
      }),
    };
  },
  computed: {
    markerStyle() {
      if (!this.isView) return {};
      const currentLinkEl = this.links[this.currentAnchor];
      if (!currentLinkEl) return {};
      const anchorRect = this.$refs.anchorRef.getBoundingClientRect();
      const markerRect = this.$refs.markerRef.getBoundingClientRect();
      const linkRect = currentLinkEl.getBoundingClientRect();

      if (this.direction === "horizontal") {
        const left = linkRect.left - anchorRect.left;
        return {
          left: `${left}px`,
          width: `${linkRect.width}px`,
          opacity: 1,
        };
      } else {
        const top =
          linkRect.top -
          anchorRect.top +
          (linkRect.height - markerRect.height) / 2;
        return {
          top: `${top}px`,
          opacity: 1,
        };
      }
    },
  },
  mounted() {
    const hash = decodeURIComponent(window.location.hash);
    const target = hash ? document.querySelector(hash) : null;
    this.containerEl = this.getScrollContainerEl();
    if (target) {
      this.scrollTo(hash);
    } else {
      this.handleScroll();
    }
    window.addEventListener("scroll", this.handleScroll, true);
    this.$nextTick(() => (this.isView = true));
  },
  beforeDestroy() {
    window.removeEventListener("scroll", this.handleScroll, true);
  },
  methods: {
    getScrollContainerEl() {
      const el = document.querySelector("#app>.layout");
      if (!el) {
        return window;
      }
      return el;
    },
    addLink({ href, el }) {
      this.$set(this.links, [href], el);
    },
    removeLink(href) {
      this.$delete(this.links, [href]);
    },
    setCurrentAnchor(href) {
      if (href && this.currentAnchor !== href) {
        this.currentAnchor = href;
        this.$emit("change", href);
      }
    },
    scrollToAnchor(href) {
      const target = window.document.querySelector(href);
      if (!target) return;
      if (this.clearAnimate) this.clearAnimate();
      this.isScrolling = true;
      const scrollEle = getScrollElement(target, this.containerEl);
      const distance = getOffsetTopDistance(target, scrollEle);
      const max = scrollEle.scrollHeight - scrollEle.clientHeight;
      const to = Math.min(distance - this.offset, max);
      this.clearAnimate = animateScrollTo(
        this.containerEl,
        this.currentScrollTop,
        to,
        this.duration,
        () => {
          // make sure it is executed after throttleByRaf's handleScroll
          setTimeout(() => {
            this.isScrolling = false;
          }, 20);
        }
      );
    },
    scrollTo(href) {
      if (href) {
        this.setCurrentAnchor(href);
        this.scrollToAnchor(href);
      }
    },
    handleClick(e, href) {
      this.$emit("click", e, href);
      this.scrollTo(href);
    },
    getCurrentHref() {
      const scrollTop = getScrollTop(this.containerEl);
      const anchorTopList = [];

      for (const href of Object.keys(this.links)) {
        const target = document.querySelector(href);
        if (!target) continue;
        const scrollEle = getScrollElement(target, this.containerEl);
        const distance = getOffsetTopDistance(target, scrollEle);
        anchorTopList.push({
          top: distance - this.offset - this.bound,
          href,
        });
      }
      anchorTopList.sort((prev, next) => prev.top - next.top);
      for (let i = 0; i < anchorTopList.length; i++) {
        const item = anchorTopList[i];
        const next = anchorTopList[i + 1];

        if (i === 0 && scrollTop === 0) {
          return "";
        }
        if (item.top <= scrollTop && (!next || next.top > scrollTop)) {
          return item.href;
        }
      }
    },
  },
};
</script>

<style lang="scss">
.anchor-box {
  position: relative;
  border-bottom: 1px solid rgba(0, 0, 0, 0.07);
  width: 100%;
  padding: 10px 0;
  background: #fff;
  .anchor-marker {
    width: 70px;
    height: 3px;
    position: absolute;
    background: #00bd76;
    border: 4px;
    opacity: 0;
    z-index: 1000;
    transition: left 0.25s ease-in-out, opacity 0.25s;
    left: 0;
    top: 43px;
  }
  .anchor-list {
    display: flex;
    align-items: center;
    :last-child {
      border-right: none;
    }
  }
}
</style>
