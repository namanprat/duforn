// @ts-nocheck
import React, { useEffect, useRef, useState } from "react";
import { useWebglStore } from "../store/webgl";
import { cameraBasePoseRef, DEFAULT_CAMERA_BASE_POSE } from "../lib/theatre/pose";
import { getRoomCameraObject, getRoomCameraSheet } from "../lib/theatre/project";
import { isRoomNamespace, playToRoom, snapToRoom } from "../lib/theatre/roomCam";
import { getTheatreRafDriver } from "../lib/theatre/raf";

/**
 * Subscribes to Theatre room camera poses and plays directed route segments when activePage changes.
 */
export default function TheatreCam() {
  const activePage = useWebglStore((state) => state.activePage);
  const prevRoomRef = useRef(null);
  const sheetRef = useRef(null);
  const unsubscribeRef = useRef(null);
  const [theatreReady, setTheatreReady] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const setup = async () => {
      const [sheet, obj] = await Promise.all([getRoomCameraSheet(), getRoomCameraObject()]);
      if (cancelled) return;

      sheetRef.current = sheet;
      const updateCameraPose = (values) => {
        cameraBasePoseRef.current = { ...DEFAULT_CAMERA_BASE_POSE, ...values };
      };

      unsubscribeRef.current = obj.onValuesChange((values) => {
        updateCameraPose(values);
      }, getTheatreRafDriver());

      const initialRoom = isRoomNamespace(useWebglStore.getState().activePage)
        ? useWebglStore.getState().activePage
        : null;

      if (initialRoom) {
        snapToRoom(sheet, initialRoom);
        prevRoomRef.current = initialRoom;
      }

      updateCameraPose(obj.value);

      setTheatreReady(true);
    };

    setup();

    return () => {
      cancelled = true;
      unsubscribeRef.current?.();
      unsubscribeRef.current = null;
      sheetRef.current = null;
      setTheatreReady(false);
      prevRoomRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!theatreReady || !sheetRef.current) return;
    if (!isRoomNamespace(activePage)) return;

    const sheet = sheetRef.current;
    const prev = prevRoomRef.current;
    const next = activePage;

    if (prev === next) return;

    if (prev == null) {
      snapToRoom(sheet, next);
    } else {
      void playToRoom(sheet, prev, next);
    }

    prevRoomRef.current = next;
  }, [activePage, theatreReady]);

  return null;
}
