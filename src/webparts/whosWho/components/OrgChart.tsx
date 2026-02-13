import * as React from 'react';
import { useRef, useEffect, useCallback } from 'react';
import { OrgChart as D3OrgChart } from 'd3-org-chart';
import { IOrgChartNode } from './IWhosWhoProps';
import styles from './WhosWho.module.scss';

export interface IOrgChartProps {
  data: IOrgChartNode[];
  highlightedUserId: string | null;
}

export const OrgChart: React.FC<IOrgChartProps> = ({ data, highlightedUserId }) => {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<D3OrgChart<IOrgChartNode> | null>(null);

  const renderChart = useCallback(() => {
    if (!chartContainerRef.current || data.length === 0) return;

    // Clear previous chart
    chartContainerRef.current.innerHTML = '';

    const chart = new D3OrgChart<IOrgChartNode>()
      .container(chartContainerRef.current as any)
      .data(data as any)
      .nodeId((d: any) => d.id)
      .parentNodeId((d: any) => d.parentId)
      .nodeWidth(() => 280)
      .nodeHeight(() => 140)
      .childrenMargin(() => 60)
      .siblingsMargin(() => 30)
      .compactMarginBetween(() => 35)
      .compactMarginPair(() => 30)
      .neighbourMargin(() => 30)
      .nodeContent((d: any) => {
        const node: IOrgChartNode = d.data;
        const isHighlighted = node.id === highlightedUserId;
        const borderColor = isHighlighted ? '#0078d4' : '#e1e1e1';
        const bgColor = isHighlighted ? '#f0f6ff' : '#ffffff';

        return `
          <div style="
            padding: 16px;
            border-radius: 8px;
            border: 2px solid ${borderColor};
            background-color: ${bgColor};
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            height: ${d.height}px;
            box-sizing: border-box;
            display: flex;
            flex-direction: column;
            transition: all 0.3s ease;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          ">
            <div style="display: flex; align-items: center; margin-bottom: 8px;">
              <div style="
                width: 40px;
                height: 40px;
                border-radius: 50%;
                background: linear-gradient(135deg, #0078d4, #106ebe);
                color: white;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 16px;
                font-weight: 600;
                margin-right: 12px;
                flex-shrink: 0;
              ">
                ${node.photo
                  ? `<img src="${node.photo}" style="width:40px;height:40px;border-radius:50%;object-fit:cover;" />`
                  : node.displayName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
                }
              </div>
              <div style="overflow: hidden;">
                <div style="font-weight: 600; font-size: 14px; color: #323130; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
                  ${node.displayName}
                </div>
                <div style="font-size: 12px; color: #605e5c; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
                  ${node.jobTitle}
                </div>
              </div>
            </div>
            <div style="font-size: 11px; color: #8a8886; margin-top: auto;">
              ${node.department ? `<div>📁 ${node.department}</div>` : ''}
              ${node.officeLocation ? `<div>📍 ${node.officeLocation}</div>` : ''}
            </div>
          </div>
        `;
      })
      .render();

    chartRef.current = chart;
  }, [data, highlightedUserId]);

  // Initial render
  useEffect(() => {
    renderChart();
  }, [renderChart]);

  // Handle highlighted user changes - expand and center on the node
  useEffect(() => {
    if (!chartRef.current || !highlightedUserId) return;

    try {
      chartRef.current.setCentered(highlightedUserId).render();
    } catch (e) {
      console.warn('Could not center on node:', e);
    }
  }, [highlightedUserId]);

  return (
    <div className={styles.orgChartWrapper}>
      <div ref={chartContainerRef} className={styles.orgChart} />
    </div>
  );
};
