import { expect } from 'chai';
import sinon from 'sinon';
import createSpacing from '../createTheme/createSpacing';
import createBreakpoints from '../createTheme/createBreakpoints';
import {
  traverseBreakpoints,
  generateGridStyles,
  generateGridSizeStyles,
  generateGridColumnsStyles,
  generateGridRowSpacingStyles,
  generateGridColumnSpacingStyles,
  generateGridOffsetStyles,
  generateSizeClassNames,
  generateSpacingClassNames,
  generateDirectionClasses,
  filterBreakpointKeys,
} from './gridGenerator';

const spacing = createSpacing();
const breakpoints = createBreakpoints({});

describe('grid generator', () => {
  describe('traverse breakpoints', () => {
    it('supports array', () => {
      const styles = {};
      traverseBreakpoints(breakpoints, [1, 2, 3, 4, 5], (appendStyle, value) => {
        appendStyle(styles, { margin: value });
      });
      expect(styles).to.deep.equal({
        margin: 1,
        '@media (min-width:600px)': {
          margin: 2,
        },
        '@media (min-width:900px)': {
          margin: 3,
        },
        '@media (min-width:1200px)': {
          margin: 4,
        },
        '@media (min-width:1536px)': {
          margin: 5,
        },
      });
    });

    it('supports object', () => {
      const styles = {};
      traverseBreakpoints(
        breakpoints,
        { xs: 1, sm: 2, md: 3, lg: 4, xl: 5 },
        (appendStyle, value) => {
          appendStyle(styles, { margin: value });
        },
      );
      expect(styles).to.deep.equal({
        margin: 1,
        '@media (min-width:600px)': {
          margin: 2,
        },
        '@media (min-width:900px)': {
          margin: 3,
        },
        '@media (min-width:1200px)': {
          margin: 4,
        },
        '@media (min-width:1536px)': {
          margin: 5,
        },
      });
    });

    it('works with mixed object', () => {
      const styles = {};
      traverseBreakpoints(
        breakpoints,
        { a: 2, b: 5, xs: 1, sm: 2, md: 3, foo: () => {}, bar: [] },
        (appendStyle, value) => {
          appendStyle(styles, { margin: value });
        },
      );
      expect(styles).to.deep.equal({
        margin: 1,
        '@media (min-width:600px)': {
          margin: 2,
        },
        '@media (min-width:900px)': {
          margin: 3,
        },
      });
    });

    it('does not iterate undefined value', () => {
      const styles = {};
      traverseBreakpoints(breakpoints, { xs: 1, sm: undefined, md: 3 }, (appendStyle, value) => {
        appendStyle(styles, { margin: value });
      });
      expect(styles).to.deep.equal({
        margin: 1,
        '@media (min-width:900px)': {
          margin: 3,
        },
      });
    });

    it('filters out breakpoints keys based on responsive keys', () => {
      const styles = { sm: 6, md: 3, xl: 2, xs: 1 };
      const filteredKeys = filterBreakpointKeys(breakpoints.keys, Object.keys(styles));
      expect(filteredKeys).to.deep.equal(['xs', 'sm', 'md', 'xl']);
    });

    describe('custom breakpoints', () => {
      const customBreakpoints = createBreakpoints({
        values: { xxs: 0, xs: 400, sm: 600, md: 768 },
      });

      it('supports array', () => {
        const styles = {};
        traverseBreakpoints(customBreakpoints, [1, 2, 3, 4, 5], (appendStyle, value) => {
          appendStyle(styles, { margin: value });
        });
        expect(styles).to.deep.equal({
          margin: 1,
          '@media (min-width:400px)': {
            margin: 2,
          },
          '@media (min-width:600px)': {
            margin: 3,
          },
          '@media (min-width:768px)': {
            margin: 4,
          },
        });
      });

      it('supports object', () => {
        const styles = {};
        traverseBreakpoints(
          customBreakpoints,
          { xxs: 1, xs: 2, sm: 3, md: 4, lg: 5 }, // lg is not a part of custom breakpoints
          (appendStyle, value) => {
            appendStyle(styles, { margin: value });
          },
        );
        expect(styles).to.deep.equal({
          margin: 1,
          '@media (min-width:400px)': {
            margin: 2,
          },
          '@media (min-width:600px)': {
            margin: 3,
          },
          '@media (min-width:768px)': {
            margin: 4,
          },
        });
      });

      it('supports object (random order)', () => {
        const newBreakpoints = createBreakpoints({
          values: { mobile: 0, laptop: 1024, tablet: 640, desktop: 1280 },
        });
        const styles = {};
        traverseBreakpoints(
          newBreakpoints,
          { monitor: 5, laptop: 3, mobile: 4, desktop: 2, tablet: 1 }, // lg is not a part of custom breakpoints
          (appendStyle, value) => {
            appendStyle(styles, { margin: value });
          },
        );
        expect(styles).to.deep.equal({
          margin: 4,
          '@media (min-width:640px)': {
            margin: 1,
          },
          '@media (min-width:1024px)': {
            margin: 3,
          },
          '@media (min-width:1280px)': {
            margin: 2,
          },
        });
      });
    });

    describe('new breakpoints', () => {
      const newBreakpoints = createBreakpoints({
        values: {
          // order does not matter
          laptop: 1024,
          tablet: 640,
          mobile: 0,
          desktop: 1280,
        },
      });

      it('supports array', () => {
        const styles = {};
        traverseBreakpoints(newBreakpoints, [1, 2, 3, 4], (appendStyle, value) => {
          appendStyle(styles, { margin: value });
        });
        expect(styles).to.deep.equal({
          margin: 1,
          '@media (min-width:640px)': {
            margin: 2,
          },
          '@media (min-width:1024px)': {
            margin: 3,
          },
          '@media (min-width:1280px)': {
            margin: 4,
          },
        });
      });

      it('supports object', () => {
        const styles = {};
        traverseBreakpoints(
          newBreakpoints,
          { mobile: 1, tablet: 2, laptop: 3, desktop: 4, monitor: 5 }, // monitor is not a part of custom breakpoints
          (appendStyle, value) => {
            appendStyle(styles, { margin: value });
          },
        );
        expect(styles).to.deep.equal({
          margin: 1,
          '@media (min-width:640px)': {
            margin: 2,
          },
          '@media (min-width:1024px)': {
            margin: 3,
          },
          '@media (min-width:1280px)': {
            margin: 4,
          },
        });
      });
    });
  });

  describe('generateGridStyles', () => {
    it('root container', () => {
      const result = generateGridStyles({ ownerState: { container: true, level: 0 } });
      expect(result).to.deep.equal({
        minWidth: 0,
        boxSizing: 'border-box',
        display: 'flex',
        flexWrap: 'wrap',
        margin: 'calc(var(--Grid-rowSpacing) / -2) calc(var(--Grid-columnSpacing) / -2)',
      });
    });

    it('nested container level 1', () => {
      const result = generateGridStyles({ ownerState: { container: true, level: 1 } });
      sinon.assert.match(result, {
        margin: `calc(var(--Grid-rowSpacingLevel1) / -2) calc(var(--Grid-columnSpacingLevel1) / -2)`,
        padding: `calc(var(--Grid-rowSpacing) / 2) calc(var(--Grid-columnSpacing) / 2)`,
      });
    });

    it('nested container level 2', () => {
      const result = generateGridStyles({ ownerState: { container: true, level: 2 } });
      sinon.assert.match(result, {
        margin: `calc(var(--Grid-rowSpacingLevel2) / -2) calc(var(--Grid-columnSpacingLevel2) / -2)`,
        padding: `calc(var(--Grid-rowSpacingLevel1) / 2) calc(var(--Grid-columnSpacingLevel1) / 2)`,
      });
    });

    it('root container with disableEqualOverflow', () => {
      const result = generateGridStyles({
        ownerState: { container: true, level: 1, disableEqualOverflow: true },
      });
      sinon.assert.match(result, {
        margin: `calc(var(--Grid-rowSpacingLevel1) * -1) 0px 0px calc(var(--Grid-columnSpacingLevel1) * -1)`,
        padding: `var(--Grid-rowSpacing) 0px 0px var(--Grid-columnSpacing)`,
      });
    });

    it('nested container without disableEqualOverflow but parent has', () => {
      const result = generateGridStyles({
        ownerState: {
          container: true,
          level: 1,
          disableEqualOverflow: false,
          parentDisableEqualOverflow: true,
        },
      });
      sinon.assert.match(result, {
        margin: `calc(var(--Grid-rowSpacingLevel1) / -2) calc(var(--Grid-columnSpacingLevel1) / -2)`,
        padding: `var(--Grid-rowSpacing) 0px 0px var(--Grid-columnSpacing)`,
      });
    });

    it('item', () => {
      const result = generateGridStyles({ ownerState: { container: false, level: 1 } });
      expect(result).to.deep.equal({
        minWidth: 0,
        boxSizing: 'border-box',
        padding: `calc(var(--Grid-rowSpacing) / 2) calc(var(--Grid-columnSpacing) / 2)`,
      });
    });

    it('item with disableEqualOverflow', () => {
      const result = generateGridStyles({
        ownerState: { container: false, disableEqualOverflow: true },
      });
      sinon.assert.match(result, {
        padding: `var(--Grid-rowSpacing) 0px 0px var(--Grid-columnSpacing)`,
      });
    });

    it('item level 2', () => {
      const result = generateGridStyles({
        ownerState: { container: false, disableEqualOverflow: true, level: 2 },
      });
      sinon.assert.match(result, {
        padding: `var(--Grid-rowSpacingLevel1) 0px 0px var(--Grid-columnSpacingLevel1)`,
      });
    });
  });

  describe('generateGridSizeStyles', () => {
    it('works with supported format', () => {
      expect(
        generateGridSizeStyles({
          theme: { breakpoints },
          ownerState: {
            gridSize: {
              xs: 'auto',
              sm: 6,
              md: true,
              lg: 4,
              xl: 'auto',
            },
            // should not consider other props
            rowSpacing: 1,
            columnSpacing: { xs: 1, sm: 2 },
          },
        }),
      ).to.deep.equal({
        flexBasis: 'auto',
        flexGrow: 0,
        flexShrink: 0,
        maxWidth: 'none',
        width: 'auto',
        '@media (min-width:600px)': {
          flexBasis: 'auto',
          flexGrow: 0,
          width: `calc(100% * 6 / var(--Grid-columns))`,
        },
        '@media (min-width:900px)': {
          flexBasis: 0,
          flexGrow: 1,
          maxWidth: '100%',
        },
        '@media (min-width:1200px)': {
          flexBasis: 'auto',
          flexGrow: 0,
          width: `calc(100% * 4 / var(--Grid-columns))`,
        },
        '@media (min-width:1536px)': {
          flexBasis: 'auto',
          flexGrow: 0,
          flexShrink: 0,
          maxWidth: 'none',
          width: 'auto',
        },
      });
    });
  });

  describe('generateGridColumnsStyles', () => {
    it('supports number', () => {
      expect(
        generateGridColumnsStyles({
          theme: { breakpoints },
          ownerState: { container: true, columns: 16 },
        }),
      ).to.deep.equal({
        '--Grid-columns': 16,
      });
    });

    it('supports responsive', () => {
      expect(
        generateGridColumnsStyles({
          theme: { breakpoints },
          ownerState: { container: true, columns: { xs: 6, sm: 8, md: 12, lg: 16 } },
        }),
      ).to.deep.equal({
        '--Grid-columns': 6,
        '@media (min-width:600px)': {
          '--Grid-columns': 8,
        },
        '@media (min-width:900px)': {
          '--Grid-columns': 12,
        },
        '@media (min-width:1200px)': {
          '--Grid-columns': 16,
        },
      });
    });

    it('has default of 12 if the smallest breakpoint is not specified', () => {
      expect(
        generateGridColumnsStyles({
          theme: { breakpoints },
          ownerState: { container: true, columns: { lg: 16 } },
        }),
      ).to.deep.equal({
        '--Grid-columns': 12,
        '@media (min-width:1200px)': {
          '--Grid-columns': 16,
        },
      });
    });
  });

  describe('generateGridRowSpacingStyles', () => {
    it('supports number', () => {
      expect(
        generateGridRowSpacingStyles({
          theme: { breakpoints, spacing },
          ownerState: { container: true, rowSpacing: 2 },
        }),
      ).to.deep.equal({
        '--Grid-rowSpacing': '16px',
      });
    });

    it('supports string', () => {
      expect(
        generateGridRowSpacingStyles({
          theme: { breakpoints, spacing },
          ownerState: { container: true, rowSpacing: '1rem' },
        }),
      ).to.deep.equal({
        '--Grid-rowSpacing': '1rem',
      });
    });

    it('supports responsive', () => {
      expect(
        generateGridRowSpacingStyles({
          theme: { breakpoints, spacing },
          ownerState: { container: true, rowSpacing: { xs: 2, md: 3, xl: 0 } },
        }),
      ).to.deep.equal({
        '--Grid-rowSpacing': '16px',
        '@media (min-width:900px)': {
          '--Grid-rowSpacing': '24px',
        },
        '@media (min-width:1536px)': {
          '--Grid-rowSpacing': '0px',
        },
      });

      expect(
        generateGridRowSpacingStyles({
          theme: { breakpoints, spacing },
          ownerState: { container: true, rowSpacing: { xs: 0, md: 2, xl: 0 } },
        }),
      ).to.deep.equal({
        '--Grid-rowSpacing': '0px',
        '@media (min-width:900px)': {
          '--Grid-rowSpacing': '16px',
        },
        '@media (min-width:1536px)': {
          '--Grid-rowSpacing': '0px',
        },
      });
    });

    it('nested item level 1 should have default spacing set to parent', () => {
      const result = generateGridRowSpacingStyles({
        theme: { breakpoints },
        ownerState: { container: true, level: 1 },
      });
      expect(result['--Grid-rowSpacingLevel1']).to.equal('var(--Grid-rowSpacing)');
    });
  });

  describe('generateGridColumnSpacingStyles', () => {
    it('supports number', () => {
      expect(
        generateGridColumnSpacingStyles({
          theme: { breakpoints, spacing },
          ownerState: { container: true, columnSpacing: 2 },
        }),
      ).to.deep.equal({
        '--Grid-columnSpacing': '16px',
      });
    });

    it('supports string', () => {
      expect(
        generateGridColumnSpacingStyles({
          theme: { breakpoints, spacing },
          ownerState: { container: true, columnSpacing: '1rem' },
        }),
      ).to.deep.equal({
        '--Grid-columnSpacing': '1rem',
      });
    });

    it('supports responsive', () => {
      expect(
        generateGridColumnSpacingStyles({
          theme: { breakpoints, spacing },
          ownerState: { container: true, columnSpacing: { xs: 2, md: 3, xl: 0 } },
        }),
      ).to.deep.equal({
        '--Grid-columnSpacing': '16px',
        '@media (min-width:900px)': {
          '--Grid-columnSpacing': '24px',
        },
        '@media (min-width:1536px)': {
          '--Grid-columnSpacing': '0px',
        },
      });

      expect(
        generateGridColumnSpacingStyles({
          theme: { breakpoints, spacing },
          ownerState: { container: true, columnSpacing: { xs: 0, md: 2, xl: 0 } },
        }),
      ).to.deep.equal({
        '--Grid-columnSpacing': '0px',
        '@media (min-width:900px)': {
          '--Grid-columnSpacing': '16px',
        },
        '@media (min-width:1536px)': {
          '--Grid-columnSpacing': '0px',
        },
      });
    });

    it('nested item level 1 should have default spacing set to parent', () => {
      const result = generateGridColumnSpacingStyles({
        theme: { breakpoints },
        ownerState: { container: true, level: 1 },
      });
      expect(result['--Grid-columnSpacingLevel1']).to.equal('var(--Grid-columnSpacing)');
    });
  });

  describe('generateGridOffsetStyles', () => {
    it('supports responsive object', () => {
      expect(
        generateGridOffsetStyles({
          theme: { breakpoints, spacing },
          ownerState: { gridOffset: { xs: 0, md: 5, lg: 'auto' } },
        }),
      ).to.deep.equal({
        marginLeft: '0px',
        '@media (min-width:900px)': {
          marginLeft: `calc(100% * 5 / var(--Grid-columns))`,
        },
        '@media (min-width:1200px)': {
          marginLeft: `auto`,
        },
      });
    });
  });

  describe('class names', () => {
    it('should generate correct grid size class names', () => {
      expect(
        generateSizeClassNames({
          xs: 'auto',
          sm: 4,
          md: false,
          lg: undefined,
          xl: true,
        }),
      ).to.deep.equal(['grid-xs-auto', 'grid-sm-4', 'grid-xl-true']);
    });

    it('should generate correct spacing class names', () => {
      expect(generateSpacingClassNames()).to.deep.equal([]);
      expect(generateSpacingClassNames([0, 1])).to.deep.equal([]);

      expect(generateSpacingClassNames(2)).to.deep.equal(['spacing-xs-2']);
      expect(
        generateSpacingClassNames({
          xs: 0,
          sm: 2,
          lg: 4,
          xl: '1rem', // should not appear in class name
        }),
      ).to.deep.equal(['spacing-sm-2', 'spacing-lg-4']);
    });

    it('should work with any breakpoint', () => {
      expect(
        generateSizeClassNames({
          mobile: 'auto',
          tablet: 4,
        }),
      ).to.deep.equal(['grid-mobile-auto', 'grid-tablet-4']);

      expect(generateSpacingClassNames(2, 'mobile')).to.deep.equal(['spacing-mobile-2']);

      expect(
        generateSpacingClassNames({
          mobile: 3,
          tablet: 4,
        }),
      ).to.deep.equal(['spacing-mobile-3', 'spacing-tablet-4']);
    });
  });

  describe('generateDirectionClasses', () => {
    it('should generate correct direction class names', () => {
      expect(generateDirectionClasses()).to.deep.equal([]);
      expect(generateDirectionClasses('row')).to.deep.equal(['direction-xs-row']);
      expect(generateDirectionClasses('column')).to.deep.equal(['direction-xs-column']);
      expect(
        generateDirectionClasses({
          xs: 'row',
          sm: 'column',
          md: 'row',
        }),
      ).to.deep.equal(['direction-xs-row', 'direction-sm-column', 'direction-md-row']);
    });
  });
});
