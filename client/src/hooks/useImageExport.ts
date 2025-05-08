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
            // Use html-to-image to convert the referenced element to a PNG data URL
            const dataUrl = await toPng(elementRef.current, { 
                cacheBust: true, // Avoid using cached images for fresh render
                // You can adjust quality, pixelRatio etc. here if needed
                // quality: 0.95, 
                // backgroundColor: 'white', // Optional: specify background for transparent elements
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