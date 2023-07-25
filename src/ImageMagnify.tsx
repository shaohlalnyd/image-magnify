import { MouseEvent, useCallback, useEffect, useMemo, useRef } from "react";

type offset = { top?: number; left?: number };

const getOffset = (el: HTMLImageElement): offset => {
  if (el) {
    const elRect = el.getBoundingClientRect();
    return { left: elRect.left, top: elRect.top };
  }
  return { left: 0, top: 0 };
};

type ImageZoomProps = {
  scale?: number;
  src: string;
  zoomPosition?: "left" | "right" | "bottom" | "top";
  offsetVertical?: number;
  offsetHorizontal?: number;
};

function ImageMagnify(props: ImageZoomProps) {
  const {
    scale = 1.2,
    src,
    zoomPosition = "right",
    offsetHorizontal = 0,
    offsetVertical = 0,
  } = props;
  const imageRef = useRef<HTMLImageElement | null>(null);
  const lensRef = useRef<HTMLDivElement | null>(null);
  const zoomedImageRef = useRef<HTMLImageElement | null>(null);
  const lensOffset = useRef<offset | null>(null);
  const scaleX = useRef<number | undefined>(undefined);
  const scaleY = useRef<number | undefined>(undefined);
  const offset = useRef<offset | undefined>();

  const topLimit = (min: number) => {
    return (imageRef.current?.height ?? 0) - min;
  };
  const leftLimit = (min: number) => {
    return (imageRef.current?.width ?? 0) - min;
  };

  const getValue = (val: number, min: number, max: number) => {
    if (val < min) {
      return min;
    }
    if (val > max) {
      return max;
    }
    return val;
  };

  const getPosition = (pos: number, min: number, max: number) => {
    const value = getValue(pos, min, max);
    return value - min;
  };

  const zoomLensLeft = (left: number) => {
    if (lensRef.current && imageRef.current) {
      const leftMin = lensRef.current.clientWidth / 2;
      return getPosition(left, leftMin, leftLimit(leftMin));
    }
  };

  const zoomLensTop = (top: number) => {
    if (lensRef.current && imageRef.current) {
      const topMin = lensRef.current.clientHeight / 2;
      return getPosition(top, topMin, topLimit(topMin));
    }
  };

  const setZoomedImgSize = () => {
    const sourceImageWidth = imageRef.current?.width;
    const sourceImageHeight = imageRef.current?.height;
    const sourceImageNaturalWidth = imageRef.current?.naturalWidth;
    const sourceImageNaturalHeight = imageRef.current?.naturalHeight;
    if (zoomedImageRef.current) {
      if (sourceImageWidth && sourceImageHeight) {
        zoomedImageRef.current.style.width = `${sourceImageWidth * scale}px`;
        zoomedImageRef.current.style.height = `${sourceImageHeight * scale}px`;
      }

      if (sourceImageNaturalWidth && sourceImageNaturalHeight) {
        zoomedImageRef.current.style.backgroundSize = `${sourceImageNaturalWidth}px ${sourceImageNaturalHeight}px`;
      }
    }
  };
  const mouseMove = (
    event: MouseEvent<HTMLDivElement, globalThis.MouseEvent>
  ) => {
    let offsetX, offsetY, backgroundTop, backgroundRight, backgroundPosition;
    if (
      offset.current?.left &&
      offset.current.top &&
      scaleX.current &&
      scaleY.current &&
      zoomedImageRef.current &&
      lensRef.current
    ) {
      offsetX = zoomLensLeft(event.clientX - offset.current.left);
      offsetY = zoomLensTop(event.clientY - offset.current.top);
      if (offsetX!==undefined && offsetY!==undefined) {
        
        lensOffset.current = { top: offsetY, left: offsetX };
        backgroundTop = offsetX * scaleX.current;
        backgroundRight = offsetY * scaleY.current;
        backgroundPosition =
          "-" + backgroundTop + "px " + "-" + backgroundRight + "px";
        zoomedImageRef.current.style.backgroundPosition = backgroundPosition;
        lensRef.current.style.cssText +=
          "transform:" +
          "translate(" +
          offsetX +
          "px," +
          offsetY +
          "px);display: block;left:0px;top:0px;";
      }
    }
  };

  const mouseEnter = () => {
    if (zoomedImageRef.current && lensRef.current) {
      zoomedImageRef.current.style.display = "block";
      lensRef.current.style.display = "block";
    }
  };

  const mouseLeave = () => {
    if (zoomedImageRef.current && lensRef.current) {
      zoomedImageRef.current.style.display = "none";
      lensRef.current.style.display = "none";
    }
  };

  const imageRefChanged = useCallback((value: HTMLImageElement) => {
    if (value) {
      imageRef.current = value;
      getOffset(imageRef.current);
    }
  }, []);

  const lensRefChanged = useCallback((value: HTMLDivElement) => {
    if (value) {
      lensRef.current = value;
      lensRef.current.style.backgroundColor = "white";
      lensRef.current.style.opacity = "0.4";
    }
  }, []);

  useEffect(() => {
    if (imageRef.current) {
      offset.current = getOffset(imageRef.current);
    }
  }, [imageRef]);

  const setZoomLensDimensions = () => {
    if (imageRef.current && lensRef.current) {
      const imageWidth = imageRef.current.width;
      const imageHeight = imageRef.current.height;
      const imageNaturalWidth = imageRef.current.naturalWidth;
      const imageNaturalHeight = imageRef.current.naturalHeight;
      const lensWidth = imageWidth / (imageNaturalWidth / (imageWidth * scale));
      const lensHeight =
        imageHeight / (imageNaturalHeight / (imageHeight * scale));

      lensRef.current.style.position = "absolute";
      lensRef.current.style.width = `${lensWidth}px`;
      lensRef.current.style.height = `${lensHeight}px`;
    }
  };

  const setImagesInformation = () => {
    if (zoomedImageRef.current) {
      zoomedImageRef.current.style.backgroundImage = `url(${src})`;
      zoomedImageRef.current.style.display = "none";
    }
  };

  const valuingOptions = () => {
    if (imageRef.current) {
      scaleX.current = imageRef.current.naturalWidth / imageRef.current.width;
      scaleY.current = imageRef.current.naturalHeight / imageRef.current.height;
      offset.current = getOffset(imageRef.current);
    }
  };

  const onImageLoad = () => {
    valuingOptions();
    setZoomedImgSize();
    setZoomLensDimensions();
    setImagesInformation();
  };

  useEffect(() => {
    const handleWindowResize = () => {
    if (imageRef.current) {
      offset.current = getOffset(imageRef.current)
    }
    };

    window.addEventListener('resize', handleWindowResize);

    return () => {
      window.removeEventListener('resize', handleWindowResize);
    };
  });



  const setZoomedImagePosition = useMemo<{
    top?: string;
    left?: string;
    transform?: string;
    bottom?: string;
  }>(() => {
    switch (zoomPosition) {
      case "left":
        return {
          top: `${offsetVertical}px`,
          left: `${offsetHorizontal - offsetHorizontal * 2}px`,
          transform: "translateX(-100%)",
        };
      case "top":
        return {
          top: `${offsetVertical - offsetVertical * 2}px`,
          left: `calc(50% + ${offsetHorizontal}px)`,
          transform: "translate3d(-50%, -100%, 0)",
        };
      case "bottom":
        return {
          bottom: `${offsetVertical - offsetVertical * 2}px`,
          left: `calc(50% ${offsetHorizontal}px)`,
          transform: "translate3d(-50%, 100%, 0)",
        };
      case "right":
        return {
          top: `${offsetVertical}px`,
          right: `${offsetHorizontal - offsetHorizontal * 2}px`,
          transform: "translateX(100%)",
        };
    }
  }, [zoomPosition, offsetHorizontal, offsetVertical]);

  return (
    <div style={{ position: "relative" }}>
      <div
        onMouseMove={mouseMove}
        onMouseEnter={() => mouseEnter()}
        onMouseLeave={() => mouseLeave()}
      >
        <img
          onLoad={() => onImageLoad()}
          ref={imageRefChanged}
          src={src}
          width={500}
        />
        <div ref={lensRefChanged} />
      </div>

      <img
        ref={zoomedImageRef}
        style={{
          backgroundRepeat: "no-repeat",
          position: "absolute",
          ...setZoomedImagePosition,
        }}
      />
    </div>
  );
}

export { ImageMagnify };
