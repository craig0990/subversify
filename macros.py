import glob
import os
import re
import textwrap

def define_env(env):
    "Custom macros for MKDocs"

    #@env.macro
    def snippet(filename, tabbed=False, language="typescript", section=None):
        """
        Generate a code snippet block for MKDocs.

        :param filename: The file path to include.
        :param language: The language for the Markdown code block. Set to None for no language.
        :return: A formatted Markdown code block with tabs and included content.
        """
        # After dropping the first subfolder, join the rest
        tab_title = re.sub(r"^docs/samples/[^/]+/", "", filename)
        tab_title = os.path.basename(filename);

        language_attr = f"{language}" if language else ""
        tab_header = f"/// tab | {tab_title}" if tabbed else ""

        snippet = filename if section is None else f"{filename}:{section}"

        # Use textwrap.dedent for clean formatting
        return textwrap.dedent(f"""\
            {tab_header}
            ```{language_attr} linenums="1"
            --8<-- "{snippet}"
            ```
            {"///" if tabbed else ""}
        """)

    #@env.macro
    def snippet_folder(folder):
        """
        Generate a collection of snippets for all top-level `.ts` files in the given folder.

        :param folder: The folder path to include files from.
        :return: Formatted snippets for all `.ts` files in the folder.
        """
        # Find all .ts files in the given folder
        files = sorted(glob.glob(os.path.join(folder, "*.ts")))
        snippets = [snippet(file, tabbed=True) for file in files]  # Generate snippets for each file
        return "\n\n".join(snippets)  # Join snippets with an extra newline

import re

def on_post_page_macros(env):
    """
    Process custom comment tags (<!--: ... -->) and pass through
    the content inside the comments after macros have been rendered for a specific page.
    This allows the use of any syntax inside the comments for further processing by other plugins.
    """
    # Start chatting for debug logs
    chatter = env.start_chatting("mdirective")


    if env.page.title == "Home":
        chatter(f"Modifying {env.page.title} metadata")
        env.page.meta["hide"] = ["toc", "navigation"]
        env.page.meta["search"] = dict.fromkeys(["exclude"], True)

    # Regex pattern to match custom comment tags (e.g., <!--: anything here -->)
    directive_pattern = r"<!--:\s*(.*?)\s*-->"

    def preprocess_directives(markdown_content):
        """
        Process the content inside the <!--: ... --> comments and extract the inner content.
        This content can be further processed by other markdown plugins.
        """
        def replacer(match):
            # Extract the content inside the <!--: ... --> comment
            content = match.group(1).strip()

            # Log the directive found and its content
            chatter(f"Directive: {match.group(0)} parsed to: {content}")

            # Return the content as-is (this allows for further processing or direct insertion)
            return content

        # Replace all <!--: ... --> comments with their inner content
        return re.sub(directive_pattern, replacer, markdown_content)

    # Process the Markdown content to extract the content from directives
    transformed_markdown = preprocess_directives(env.markdown)

    # Update the markdown in env with the transformed content
    env.markdown = transformed_markdown
