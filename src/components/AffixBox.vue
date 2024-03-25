<!--
 * @LastEditors: v-bianjunping
 * @LastEditTime: 2024-03-24 16:44:00
-->
<template>
  <div ref="fixedBox" class="affix-class">
    <div class="fixed-content" :class="fixed" :style="affixStyle">
      <slot />
    </div>
  </div>
</template>
<script>
import { useElementBounding, getScrollContainer } from "@/utils/domUtils.js";
import debounce from "lodash.debounce";
export default {
  name: "AffixBox",
  props: {
    el: {
      type: String,
      default: "",
    },
    /**
     * @description offset distance
     * */
    offset: {
      type: Number,
      default: 0,
    },
    /**
     * @description position of affix
     * */
    position: {
      type: String,
      values: ["top", "bottom"],
      default: "top",
    },
  },
  data() {
    return {
      target: null,
      isFixed: false,
      scrollTop: 0,
      transform: 0,
      scrollContainer: null,
      updateRoot: null,
      fixedStyle: {},
      eleStyle: {},
      ob: null,
    };
  },
  computed: {
    fixed() {
      if (this.isFixed) return "fixed";
      return "";
    },
    affixStyle() {
      if (this.isFixed) {
        const offset = this.offset ? this.offset + "px" : 0;
        return {
          height: `${this.fixedStyle.height}px`,
          width: `${this.fixedStyle.width}px`,
          top: this.position === "top" ? offset : "",
          bottom: this.position === "bottom" ? offset : "",
          transform: this.transform ? `translateY(${this.transform}px)` : "",
          zIndex: this.zIndex,
        };
      }
      return {};
    },
  },
  watch: {
    isFixed(val) {
      this.$emit("change", val);
    },
    fixedStyle: {
      handler() {
        this.update();
      },
      deep: true,
    },
    eleStyle: {
      handler() {
        this.update();
      },
      deep: true,
    },
  },
  mounted() {
    const { ob, update } = useElementBounding(
      this.$refs.fixedBox,
      this.handlerFixedObserve,
      { windowScroll: false }
    );
    this.ob = ob;
    if (this.el) {
      this.target = document.querySelector < HTMLElement > this.el ?? undefined;
      if (this.target)
        new Error(`AffixBox => Target is not existed: ${this.target}`);
    } else {
      this.target = document.documentElement;
    }
    useElementBounding(this.target, this.handlerElementObserve);
    this.scrollContainer = getScrollContainer(this.$refs.fixedBox, true);
    this.updateRoot = update;
    this.scrollContainer.addEventListener("scroll", this.handleScroll);
    window.addEventListener("resize", this.update);
  },
  destroyed() {
    if (this.ob) {
      this.ob.cleanup();
    }
  },
  methods: {
    handlerFixedObserve(style) {
      for (let key in style) {
        this.$set(this.fixedStyle, [key], style[key]);
      }
    },
    handlerElementObserve(style) {
      for (let key in style) {
        this.$set(this.eleStyle, [key], style[key]);
      }
    },
    handleScroll() {
      this.updateRoot();
      this.$emit("scroll", {
        scrollTop: this.scrollTop,
        fixed: this.isFixed,
      });
    },
    update: debounce(function () {
      if (!this.scrollContainer) return;
      this.scrollTop =
        this.scrollContainer instanceof Window
          ? document.documentElement.scrollTop
          : this.scrollContainer.scrollTop || 0;

      if (this.position === "top") {
        if (this.target) {
          const difference =
            this.eleStyle.bottom - this.offset - this.fixedStyle.height;
          this.isFixed =
            this.offset > this.fixedStyle.top && this.eleStyle.bottom > 0;
          this.transform = difference < 0 ? difference : 0;
        } else {
          this.isFixed = this.offset > this.fixedStyle.top;
        }
      } else if (this.target) {
        const difference =
          window.innerHeight -
          this.eleStyle.top -
          this.offset -
          this.fixedStyle.height;
        this.isFixed =
          window.innerHeight - this.offset < this.fixedStyle.bottom &&
          window.innerHeight > this.eleStyle.top;
        this.transform = difference < 0 ? -difference : 0;
      } else {
        this.isFixed =
          window.innerHeight - this.offset < this.fixedStyle.bottom;
      }
    }, 16),
  },
};
</script>
<style lang="scss">
.affix-class {
  width: 100%;
  min-height: 34px;
  .fixed-content {
    width: 100%;
    height: 100%;
  }
  .fixed {
    position: fixed;
    z-index: 9999;
  }
}
</style>
