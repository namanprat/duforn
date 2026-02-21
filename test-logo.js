import fs from 'fs';
import { GLTFLoader } from 'three-stdlib';
import * as THREE from 'three';
import { gltfLoader } from './scripts/utils/loading.js'; // no wait, let's just use raw loading or Three's Node.js GLTFLoader if possible.
