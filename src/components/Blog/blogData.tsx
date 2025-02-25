import { Blog } from "@/types/blog";

const blogData: Blog[] = [
  {
    id: 1,
    title: "Best practices for organizing your music catalog",
    paragraph: "Learn how to effectively organize and manage your music collection for maximum efficiency.",
    image: "/images/blog/blog-01.jpg",
    author: {
      name: "Samuyl Joshi",
      image: "/images/blog/author-01.png",
      designation: "Music Producer",
    },
    tags: ["Music"],
    publishDate: "2024",
  },
  {
    id: 2,
    title: "Marketing strategies for independent artists",
    paragraph: "Discover effective marketing techniques to promote your music and grow your audience.",
    image: "/images/blog/blog-02.jpg",
    author: {
      name: "Musharof Chy",
      image: "/images/blog/author-02.png",
      designation: "Content Writer",
    },
    tags: ["Marketing"],
    publishDate: "2024",
  },
  {
    id: 3,
    title: "Understanding music distribution platforms",
    paragraph: "A comprehensive guide to choosing the right distribution platform for your music.",
    image: "/images/blog/blog-03.jpg",
    author: {
      name: "Lethium Deo",
      image: "/images/blog/author-03.png",
      designation: "Musician",
    },
    tags: ["Distribution"],
    publishDate: "2024",
  }
];

export default blogData;
