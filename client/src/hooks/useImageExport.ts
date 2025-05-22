import { useState, useCallback } from 'react';
import type { RefObject } from 'react';
import { toPng } from 'html-to-image';

interface UseImageExportReturn {
    exportToPng: (elementName?: string) => Promise<void>;
    isExporting: boolean;
    error: string | null;
}

/**
 * Custom hook to handle exporting a referenced HTML element to a PNG image 
 * and triggering a download.
 * 
 * @param elementRef RefObject pointing to the HTML element to be exported.
 * @returns Object containing the export function, loading state, and error state.
 */
export const useImageExport = (elementRef: RefObject<HTMLElement>): UseImageExportReturn => {
    const [isExporting, setIsExporting] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const exportToPng = useCallback(async (elementName = 'archetype-card') => {
        if (!elementRef.current) {
            setError('Element reference is not available.');
            console.error('Image Export: Cannot export because the element ref is null.');
            return;
        }

        setIsExporting(true);
        setError(null);
        console.log('Image Export: Starting export...');

        try {
            // Wait for all images to load before capturing
            const images = elementRef.current.getElementsByTagName('img');
            await Promise.all(
                Array.from(images).map(
                    (img) =>
                        new Promise((resolve, reject) => {
                            if (img.complete) {
                                resolve(null);
                            } else {
                                img.onload = () => resolve(null);
                                img.onerror = () => reject(new Error(`Failed to load image: ${img.src}`));
                            }
                        })
                )
            );

            // Add a small delay to ensure all images are fully rendered
            await new Promise(resolve => setTimeout(resolve, 100));

            // Use html-to-image to convert the referenced element to a PNG data URL
            const dataUrl = await toPng(elementRef.current, { 
                cacheBust: true, // Avoid using cached images for fresh render
                pixelRatio: 2, // Increase resolution for better quality
                skipAutoScale: true, // Prevent automatic scaling which might affect image quality
                imagePlaceholder: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=', // Transparent placeholder
                style: {
                    transform: 'none', // Prevent any transform issues
                },
                filter: (node) => {
                    // Ensure images are included in the export
                    return node.tagName !== 'SCRIPT' && node.tagName !== 'STYLE';
                }
            });
            console.log('Image Export: PNG Data URL generated.');

            // Create a temporary link to trigger the download
            const link = document.createElement('a');
            link.download = `${elementName}.png`; // File name for the download
            link.href = dataUrl;
            document.body.appendChild(link); // Append to body to ensure click works
            link.click();
            document.body.removeChild(link); // Clean up the link
            console.log('Image Export: Download triggered.');

        } catch (err: any) {
            console.error('Image Export: Failed to export element to PNG:', err);
            setError(err.message || 'Could not export image.');
        } finally {
            setIsExporting(false);
        }
    }, [elementRef]); // Dependency array includes the ref

    return { exportToPng, isExporting, error };
};
