import {useEffect, useRef, useState} from 'react';
import * as PIXI from 'pixi.js';
import {Viewport} from 'pixi-viewport';
import {useSelector, useDispatch} from 'react-redux';
import type {IRootState} from '../store/store';
import type {IGeneratedObject} from '../utils/generateObjects';
import {setObjectChildes, setSelectedObject} from '../store/slices/objectChildesSlice';
import {generateObjectChildes} from '../utils/generateObjectChildes';

const PixiCanvas = () => {
    const canvasRef = useRef<HTMLDivElement>(null);
    const appRef = useRef<PIXI.Application | null>(null);
    const viewportRef = useRef<Viewport | null>(null);
    const objects = useSelector((state: IRootState) => state.objects.objects);
    const {objectChildes, selectedObject} = useSelector((state: IRootState) => state.objectChildes);
    const lastClickTime = useRef<number>(0);
    const lastClickedRect = useRef<PIXI.Graphics | null>(null);
    const DOUBLE_CLICK_THRESHOLD = 300;
    const dispatch = useDispatch();

    // Состояние для фильтрации по статусам
    const [selectedStatuses, setSelectedStatuses] = useState<Set<string>>(new Set());
    const [isFilterActive, setIsFilterActive] = useState(false);

    useEffect(() => {
        if (canvasRef.current) {
            const canvas = document.createElement('canvas');
            const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
            const webGLSupported = !!gl;
            console.log('WebGL supported:', webGLSupported);
            if (!webGLSupported) {
                console.warn('WebGL is not supported in this browser. PixiJS will fall back to Canvas renderer.');
                alert('Ваш браузер не поддерживает WebGL. Приложение будет использовать Canvas renderer, что может снизить производительность.');
            }

            canvas.style.width = `${window.innerWidth - 100}px`
            canvas.style.height = `${window.innerHeight - 200}px`;
            canvas.style.background = "#000"

            canvasRef.current.style.width = `${window.innerWidth - 100}px`
            canvasRef.current.style.height = `${window.innerHeight - 200}px`
            canvasRef.current.style.background = "#000"
        }
    }, [!!canvasRef.current]);

    useEffect(() => {
        let mounted = true;

        const initApp = async () => {
            if (!canvasRef.current || appRef.current) return;

            try {
                const app = new PIXI.Application({
                    width: window.innerWidth - 100,
                    height: window.innerHeight - 200,
                    backgroundColor: 0xffffff,
                    antialias: true,
                    autoStart: true,
                });

                await app.init();

                if (!mounted) {
                    app.destroy(true, {children: true, texture: true, baseTexture: true});
                    return;
                }

                console.log('App initialized:', app);
                console.log('App.view:', app.view);

                let rendererType = 'Unknown';
                try {
                    rendererType = app.renderer.type === 1 ? 'WebGL' : 'Canvas';
                    console.log('Renderer type:', rendererType);
                } catch (error) {
                    console.warn('Could not determine renderer type:', error.message);
                }

                if (canvasRef.current && app.view instanceof HTMLCanvasElement) {
                    app.view.width = window.innerWidth - 100;
                    app.view.height = window.innerHeight - 200;
                    app.renderer.resize(window.innerWidth - 100, window.innerHeight - 200);
                    canvasRef.current.appendChild(app.view);
                } else {
                    app.destroy(true, {children: true, texture: true, baseTexture: true});
                    return;
                }

                const viewport = new Viewport({
                    screenWidth: app.screen.width,
                    screenHeight: app.screen.height,
                    worldWidth: app.screen.width * 2,
                    worldHeight: app.screen.height * 4,
                    events: app.renderer.events,
                });

                app.stage.addChild(viewport);
                viewportRef.current = viewport;

                viewport
                    .drag({mouseButtons: 'left', clampWheel: true})
                    .pinch()
                    .wheel({smooth: 10})
                    .decelerate({friction: 0.95, bounce: 0.8, minSpeed: 0.01});

                viewport.clampZoom({minScale: 0.2, maxScale: 20});
                viewport.clamp({
                    left: -app.screen.width,
                    right: app.screen.width * 2,
                    top: -app.screen.height * 2,
                    bottom: app.screen.height * 4,
                    underflow: 'center',
                });

                const rectHeight = 10;
                const rectWidth = rectHeight * 1.4;
                const borderWidth = 0.5;
                const spacing = rectHeight * 0.05;
                const stepX = rectWidth + spacing + borderWidth;
                const stepY = rectHeight + spacing + borderWidth;
                const thresholdDistanceWidth = rectWidth * 0.35;
                const thresholdDistanceHeight = rectHeight * 0.1;

                const centerX = Math.floor(app.screen.width / 2);
                const centerY = Math.floor(app.screen.height / 2);

                const rectangles: { graphic: PIXI.Graphics; status: string }[] = [];

                let currentHoveredStatus: string | null = null;
                let lastHoveredRectPos: { x: number; y: number } | null = null;
                let isHoveringRect = false;

                const placeObjectsInSpiral = (filteredObjects: IGeneratedObject[]) => {
                    viewport.removeChildren();
                    rectangles.length = 0;

                    let x = 0, y = 0, dx = 0, dy = -1;
                    const placedPositions = new Set<string>();
                    let objectsPlaced = 0;

                    const maxX = Math.floor((app.screen.width / stepX) * 2);
                    const maxY = Math.floor((app.screen.height / stepY) * 2);

                    for (let i = 0; i < filteredObjects.length; i++) {
                        const posX = Math.floor(centerX + x * stepX);
                        const posY = Math.floor(centerY + y * stepY);
                        const posKey = `${x},${y}`;

                        const rectLeft = posX - (rectWidth + borderWidth) / 2;
                        const rectRight = posX + (rectWidth + borderWidth) / 2;
                        const rectTop = posY - (rectHeight + borderWidth) / 2;
                        const rectBottom = posY + (rectHeight + borderWidth) / 2;

                        if (
                            rectLeft < -app.screen.width ||
                            rectRight > app.screen.width * 3 ||
                            rectTop < -app.screen.height ||
                            rectBottom > app.screen.height * 3
                        ) continue;

                        if (!placedPositions.has(posKey)) {
                            const obj = filteredObjects[i];
                            const rect = new PIXI.Graphics();
                            rect.lineStyle(borderWidth, 0x000000);
                            rect.beginFill(parseInt(obj.color.replace('#', '0x')));
                            rect.drawRect(-1, -1, rectWidth, rectHeight);
                            rect.endFill();
                            rect.x = posX;
                            rect.y = posY;
                            rect.alpha = selectedStatuses.has(obj?.status) ? 1 : 0.29;
                            rect.name = filteredObjects[i].status;

                            rect.interactive = true;
                            rect.buttonMode = true;

                            const status = obj.status;
                            rectangles.push({graphic: rect, status});

                            rect.on('pointerover', () => {
                                isHoveringRect = true;
                                lastHoveredRectPos = {x: posX, y: posY};

                                if (currentHoveredStatus !== status) {
                                    if (currentHoveredStatus) {
                                        rectangles.forEach((item) => {
                                            if (item.status === currentHoveredStatus && !selectedStatuses.size) item.graphic.alpha = 0.29;
                                        });
                                    }
                                    currentHoveredStatus = status;
                                    rectangles.forEach((item) => {
                                        if (item.status === status && !selectedStatuses.size) item.graphic.alpha = 0.68;
                                    });
                                }
                                if ((selectedStatuses.size && selectedStatuses.has(obj.status)) || !selectedStatuses.size) rect.cursor = 'pointer';
                            });

                            // обработка двойного клика на объект
                            rect.on('pointerdown', () => {
                                if ((selectedStatuses.size && selectedStatuses.has(obj.status)) || !selectedStatuses.size) {
                                    const currentTime = Date.now();
                                    if (
                                        currentTime - lastClickTime.current < DOUBLE_CLICK_THRESHOLD &&
                                        lastClickedRect.current === rect
                                    ) {
                                        const objectChildes = generateObjectChildes(obj?.guid);
                                        dispatch(setObjectChildes(objectChildes));
                                        dispatch(setSelectedObject(obj));
                                        lastClickTime.current = 0;
                                        lastClickedRect.current = null;
                                    } else {
                                        lastClickTime.current = currentTime;
                                        lastClickedRect.current = rect;
                                    }
                                }
                            });

                            rect.on('pointerout', () => {
                                isHoveringRect = false;
                            });

                            viewport.addChild(rect);
                            placedPositions.add(posKey);
                            objectsPlaced++;
                        }

                        if (x === y || (x < 0 && x === -y) || (x > 0 && x === 1 - y)) {
                            const temp = dx;
                            dx = -dy;
                            dy = temp;
                        }
                        x += dx;
                        y += dy;

                        if (Math.abs(x) > maxX || Math.abs(y) > maxY) break;
                    }
                    console.log('Objects placed in spiral:', objectsPlaced);
                };

                const createSelectedObjectDisplay = () => {
                    viewport.removeChildren();
                    rectangles.length = 0;

                    const size = Math.min(app.screen.width, app.screen.height) * 0.2;
                    const square = new PIXI.Graphics();
                    square.lineStyle(2, 0x000000);
                    square.beginFill(0xFFFF00);
                    square.drawRect(-size / 2, -size / 2, size, size);
                    square.endFill();
                    square.x = centerX;
                    square.y = centerY;

                    const text = new PIXI.Text(
                        `GUID: ${selectedObject.guid}\nName: ${selectedObject.name}\nColor: ${selectedObject.color}\nStatus: ${selectedObject.status}`,
                        {fontFamily: 'Arial', fontSize: 16, fill: 0x000000, align: 'center'}
                    );
                    text.anchor.set(0.5);
                    text.x = centerX;
                    text.y = centerY - size / 4;

                    viewport.addChild(square);
                    viewport.addChild(text);

                    const canvasHeight = app.screen.height;
                    const rectCount = Math.ceil(objectChildes?.length || 0);
                    const maxPerSide = Math.ceil(rectCount / 2);
                    const maxPerColumn = 50;
                    const totalColumnsPerSide = Math.ceil(maxPerSide / maxPerColumn);
                    const rectsPerColumn = Math.ceil(maxPerSide / totalColumnsPerSide);
                    const rectHeight = canvasHeight / rectsPerColumn;
                    const rectWidth = rectHeight;
                    const spacingPercent = 0.095;
                    const spacing = rectHeight * spacingPercent;
                    const columnWidth = rectWidth + spacing;
                    const offset = app.screen.width * 0.2;

                    const placeChildRectangles = (startX: number, startIndex: number, count: number) => {
                        let placed = startIndex;
                        for (let i = 0; i < rectsPerColumn && placed < startIndex + count; i++) {
                            if (placed >= objectChildes.length) break;
                            const child = objectChildes[placed];
                            const rect = new PIXI.Graphics();
                            rect.lineStyle(1, 0x000000);
                            rect.beginFill(parseInt(child.color.replace('#', '0x')));
                            rect.drawRect(0, 0, rectWidth, rectHeight);
                            rect.endFill();
                            rect.x = startX;
                            rect.y = centerY - (rectsPerColumn * (rectHeight + spacing)) / 2 + (i * (rectHeight + spacing));
                            rect.interactive = true;
                            rect.buttonMode = true;
                            rect.cursor = 'pointer';

                            const indexText = new PIXI.Text(placed.toString(), {
                                fontFamily: 'Arial',
                                fontSize: 12,
                                fill: 0x000000,
                                align: 'center',
                            });
                            indexText.anchor.set(0.5);
                            indexText.x = startX;
                            indexText.y = rect.y + rectHeight / 2;
                            viewport.addChild(indexText);

                            const line = new PIXI.Graphics();
                            line.lineStyle(1, 0x000000);
                            line.moveTo(startX, rect.y + rectHeight / 2);
                            line.lineTo(centerX, centerY);
                            viewport.addChild(line);

                            rect.on('pointerover', () => {
                                rect.alpha = 0.68;
                                line.alpha = 0.68;
                                indexText.alpha = 0.68;
                            });
                            rect.on('pointerout', () => {
                                rect.alpha = 1;
                                line.alpha = 1;
                                indexText.alpha = 1;
                            });

                            viewport.addChild(rect);
                            placed++;
                        }
                    };

                    let currentIndex = 0;
                    for (let col = 0; col < totalColumnsPerSide; col++) {
                        const startX = centerX - offset - (col * columnWidth);
                        const count = Math.min(maxPerColumn, maxPerSide - (col * maxPerColumn));
                        placeChildRectangles(startX, currentIndex, count);
                        currentIndex += count;
                    }

                    currentIndex = maxPerSide;
                    for (let col = 0; col < totalColumnsPerSide; col++) {
                        const startX = centerX + offset + (col * columnWidth);
                        const count = Math.min(maxPerColumn, rectCount - currentIndex);
                        placeChildRectangles(startX, currentIndex, count);
                        currentIndex += count;
                    }

                    const backButton = new PIXI.Text('Вернуться обратно ', {
                        fontFamily: 'Arial',
                        fontSize: 16,
                        fill: 0x0000FF,
                        align: 'center',
                    });
                    backButton.x = 10;
                    backButton.y = 10;
                    backButton.interactive = true;
                    backButton.buttonMode = true;
                    backButton.on('pointerdown', () => {
                        dispatch(setSelectedObject(null));
                        setSelectedStatuses(new Set());
                        setIsFilterActive(false);
                        placeObjectsInSpiral(objects); // Обновляем основной экран без переинициализации
                    });
                    viewport.addChild(backButton);
                };

                viewport.interactive = true;

                viewport.on('pointermove', (event: PIXI.FederatedPointerEvent) => {
                    if (!lastHoveredRectPos || isHoveringRect || selectedObject) return;
                    const pointerPos = event.getLocalPosition(viewport);
                    const dx = pointerPos.x - lastHoveredRectPos.x;
                    const dy = pointerPos.y - lastHoveredRectPos.y;
                    const distance = Math.sqrt(dx * dx + dy * dy);
                    if (distance <= thresholdDistanceHeight) return;
                    if (distance > thresholdDistanceWidth) {
                        if (currentHoveredStatus) {
                            rectangles.forEach((item) => {
                                if (item.status === currentHoveredStatus && !selectedStatuses.size) item.graphic.alpha = 0.29;
                            });
                            currentHoveredStatus = null;
                            lastHoveredRectPos = null;
                        }
                    }
                });

                viewport.on('pointerleave', () => {
                    if (currentHoveredStatus && !selectedObject) {
                        rectangles.forEach((item) => {
                            if (item.status === currentHoveredStatus && !selectedStatuses.size) item.graphic.alpha = 0.29;
                        });
                        currentHoveredStatus = null;
                        lastHoveredRectPos = null;
                        isHoveringRect = false;
                    }
                });

                // Инициализация при первом рендеринге
                const filteredObjects = objects;
                if (selectedObject === null && filteredObjects.length > 0) placeObjectsInSpiral(filteredObjects);
                else if (selectedObject) createSelectedObjectDisplay();

                appRef.current = app;

                const handleResize = () => {
                    if (appRef.current && appRef.current.view instanceof HTMLCanvasElement && viewportRef.current) {
                        appRef.current.view.width = window.innerWidth - 100;
                        appRef.current.view.height = window.innerHeight - 200;
                        appRef.current.renderer.resize(window.innerWidth - 100, window.innerHeight - 200);
                        viewportRef.current.resize(
                            appRef.current.screen.width,
                            appRef.current.screen.height,
                            appRef.current.screen.width * 2,
                            appRef.current.screen.height * 4
                        );
                        viewportRef.current.clamp({
                            left: -appRef.current.screen.width,
                            right: appRef.current.screen.width * 2,
                            top: -appRef.current.screen.height * 2,
                            bottom: appRef.current.screen.height * 4,
                            underflow: 'center',
                        });
                        // Обновляем содержимое без полного перезапуска
                        viewport.removeChildren();
                        rectangles.length = 0;
                        currentHoveredStatus = null;
                        lastHoveredRectPos = null;
                        isHoveringRect = false;
                        const filteredObjects = objects;
                        if (selectedObject === null && filteredObjects.length > 0) placeObjectsInSpiral(filteredObjects);
                        else if (selectedObject) createSelectedObjectDisplay();
                    }
                };

                window.addEventListener('resize', handleResize);

                return () => {
                    window.removeEventListener('resize', handleResize);
                    if (appRef.current) {
                        appRef.current.destroy(true, {children: true, texture: true, baseTexture: true});
                        appRef.current = null;
                    }
                };
            } catch (error) {
                console.error('Error initializing PixiJS:', error);
            }
        };

        if (!appRef.current) initApp();

        // Обновление содержимого при изменении состояний
        if (appRef.current && viewportRef.current) {
            viewportRef.current.removeChildren();
            rectangles.length = 0;

            const filteredObjects = isFilterActive
                ? objects.filter((obj) => selectedStatuses.has(obj.status) || selectedStatuses.size === 0)
                : objects;
            if (selectedObject === null && filteredObjects.length > 0) placeObjectsInSpiral(filteredObjects);
            else if (selectedObject) createSelectedObjectDisplay();
        }

        return () => {
            mounted = false;
            if (appRef.current) {
                appRef.current.destroy(true, {children: true, texture: true, baseTexture: true});
                appRef.current = null;
            }
            if (canvasRef.current) canvasRef.current.innerHTML = '';
        };
    }, [objects, selectedObject, selectedStatuses]);

    const uniqueStatuses = [...new Set(objects.map((obj) => obj.status))];

    const handleStatusChange = (status: string) => {
        const newSelectedStatuses = new Set(selectedStatuses);
        if (newSelectedStatuses.has(status)) newSelectedStatuses.delete(status);
        else newSelectedStatuses.add(status);
        setSelectedStatuses(newSelectedStatuses);
        setIsFilterActive(newSelectedStatuses.size > 0);
    };

    const handleSelectAll = () => {
        setSelectedStatuses(new Set(uniqueStatuses));
        setIsFilterActive(true);
    };

    const handleResetFilter = () => {
        setSelectedStatuses(new Set());
        setIsFilterActive(false);
    };

    return (
        <div>
            {selectedObject === null && (
                <div style={{padding: '10px', background: '#f0f0f0'}}>
                    <h3>Filter by Status</h3>
                    {uniqueStatuses.map((status) => (
                        <label key={status}>
                            <input
                                type="checkbox"
                                checked={selectedStatuses.has(status)}
                                onChange={() => handleStatusChange(status)}
                            />{' '}
                            {status}
                        </label>
                    ))}
                    <button onClick={handleSelectAll} style={{marginLeft: '10px'}}>
                        Все
                    </button>
                    <button onClick={handleResetFilter} style={{marginLeft: '10px'}}>
                        Reset
                    </button>
                </div>
            )}
            <div ref={canvasRef}/>
        </div>
    );
};

export default PixiCanvas;