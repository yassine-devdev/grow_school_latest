import Timeline from "@designcombo/timeline";
import {
	IComposition,
	ISize,
	ITimelineScaleState,
	ITimelineScrollState,
	ITrack,
	ITrackItem,
	ITransition,
	ItemStructure,
} from "@designcombo/types";
import { Moveable } from "@interactify/toolkit";
import { PlayerRef } from "@remotion/player";
import { create } from "zustand";

interface ITimelineStore {
	duration: number;
	fps: number;
	scale: ITimelineScaleState;
	scroll: ITimelineScrollState;
	size: ISize;
	tracks: ITrack[];
	trackItemIds: string[];
	transitionIds: string[];
	transitionsMap: Record<string, ITransition>;
	trackItemsMap: Record<string, ITrackItem>;
	structure: ItemStructure[];
	activeIds: string[];
	timeline: Timeline | null;
	setTimeline: (timeline: Timeline) => void;
	setScale: (scale: ITimelineScaleState) => void;
	setScroll: (scroll: ITimelineScrollState) => void;
	playerRef: React.RefObject<PlayerRef> | null;
	setPlayerRef: (playerRef: React.RefObject<PlayerRef> | null) => void;

	sceneMoveableRef: React.RefObject<Moveable> | null;
	setSceneMoveableRef: (ref: React.RefObject<Moveable>) => void;
	setState: (state: any) => Promise<void>;
	compositions: Partial<IComposition>[];
	setCompositions: (compositions: Partial<IComposition>[]) => void;

	background: {
		type: "color" | "image";
		value: string;
	};
	viewTimeline: boolean;
	setViewTimeline: (viewTimeline: boolean) => void;
}

const useStore = create<ITimelineStore>((set) => ({
	compositions: [],
	structure: [],
	setCompositions: (compositions) => set({ compositions }),
	size: {
		width: 1080,
		height: 1920,
	},

	background: {
		type: "color",
		value: "transparent",
	},
	viewTimeline: true,
	setViewTimeline: (viewTimeline) => set({ viewTimeline }),

	timeline: null,
	duration: 1000,
	fps: 30,
	scale: {
		// 1x distance (second 0 to second 5, 5 segments).
		index: 7,
		unit: 300,
		zoom: 1 / 300,
		segments: 5,
	},
	scroll: {
		left: 0,
		top: 0,
	},
	playerRef: null,

	activeIds: [],
	targetIds: [],
	tracks: [],
	trackItemIds: [],
	transitionIds: [],
	transitionsMap: {},
	trackItemsMap: {},
	sceneMoveableRef: null,

	setTimeline: (timeline: Timeline) =>
		set(() => ({
			timeline: timeline,
		})),
	setScale: (scale: ITimelineScaleState) =>
		set(() => ({
			scale: scale,
		})),
	setScroll: (scroll: ITimelineScrollState) =>
		set(() => ({
			scroll: scroll,
		})),
	setState: async (state) => {
		return set((currentState) => ({ ...currentState, ...state }));
	},
	setPlayerRef: (playerRef: React.RefObject<PlayerRef> | null) =>
		set({ playerRef }),
	setSceneMoveableRef: (ref) => set({ sceneMoveableRef: ref }),
}));

export default useStore;
